package vn.thelooks.wardrobe.application.service;

import java.nio.ByteBuffer;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CancellationException;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.Executor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.thelooks.wardrobe.application.port.out.ClothingItemRepository;
import vn.thelooks.wardrobe.application.port.out.GarmentDetector;
import vn.thelooks.wardrobe.application.port.out.ImageCropper;
import vn.thelooks.wardrobe.application.port.out.ImageCropper.NormalizedImage;
import vn.thelooks.wardrobe.application.port.out.ImageStorage;
import vn.thelooks.wardrobe.application.port.out.PlanLimitReader;
import vn.thelooks.wardrobe.application.port.out.ScanRepository;
import vn.thelooks.wardrobe.application.usecase.DeleteClothingItemUseCase;
import vn.thelooks.wardrobe.application.usecase.GetScanQuery;
import vn.thelooks.wardrobe.application.usecase.GetWardrobeQuery;
import vn.thelooks.wardrobe.application.usecase.ManageItemsInBulkUseCase;
import vn.thelooks.wardrobe.application.usecase.ReviewClothingItemUseCase;
import vn.thelooks.wardrobe.application.usecase.ScanClothingUseCase;
import vn.thelooks.wardrobe.domain.exception.ClothingItemNotFoundException;
import vn.thelooks.wardrobe.domain.exception.InvalidImageException;
import vn.thelooks.wardrobe.domain.exception.InvalidItemStateException;
import vn.thelooks.wardrobe.domain.exception.WardrobeFullException;
import vn.thelooks.wardrobe.domain.model.ClothingAttributes;
import vn.thelooks.wardrobe.domain.model.ClothingItem;
import vn.thelooks.wardrobe.domain.model.DetectedGarment;
import vn.thelooks.wardrobe.domain.model.ItemStatus;
import vn.thelooks.wardrobe.domain.model.Scan;
import vn.thelooks.wardrobe.domain.model.ScanStatus;
import vn.thelooks.wardrobe.domain.service.GarmentSelection;

@Service
class WardrobeService implements ScanClothingUseCase, GetScanQuery, GetWardrobeQuery, ReviewClothingItemUseCase,
        DeleteClothingItemUseCase, ManageItemsInBulkUseCase {

    private static final Logger log = LoggerFactory.getLogger(WardrobeService.class);
    static final Set<String> ACCEPTED_TYPES = Set.of("image/jpeg", "image/png");

    private final ClothingItemRepository items;
    private final ScanRepository scans;
    private final GarmentDetector detector;
    private final ImageCropper images;
    private final ImageStorage storage;
    private final PlanLimitReader plans;
    private final Executor background;
    private final Clock clock;

    WardrobeService(ClothingItemRepository items, ScanRepository scans, GarmentDetector detector, ImageCropper images,
            ImageStorage storage, PlanLimitReader plans, Executor scanExecutor, Clock clock) {
        this.items = items;
        this.scans = scans;
        this.detector = detector;
        this.images = images;
        this.storage = storage;
        this.plans = plans;
        this.background = scanExecutor;
        this.clock = clock;
    }

    // ---------------------------------------------------------------- quét ảnh

    /** Gửi lại đúng bộ ảnh trong khoảng này thì coi là trùng (bấm 2 lần, trình duyệt / proxy gửi lại request). */
    static final Duration DUPLICATE_WINDOW = Duration.ofMinutes(2);

    static String contentHash(List<UploadedImage> uploads) {
        try {
            MessageDigest sha = MessageDigest.getInstance("SHA-256");
            for (UploadedImage u : uploads) {
                sha.update(ByteBuffer.allocate(4).putInt(u.content().length).array());
                sha.update(u.content());
            }
            return HexFormat.of().formatHex(sha.digest());
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    @Override
    public Scan start(UUID ownerId, List<UploadedImage> uploads) {
        if (uploads == null || uploads.isEmpty() || uploads.size() > MAX_IMAGES) {
            throw new InvalidImageException("Gửi từ 1 đến " + MAX_IMAGES + " ảnh mỗi lần");
        }
        for (UploadedImage u : uploads) {
            if (u.content() == null || u.content().length == 0 || u.content().length > MAX_IMAGE_BYTES) {
                throw new InvalidImageException("Mỗi ảnh tối đa 10 MB");
            }
            if (u.contentType() == null || !ACCEPTED_TYPES.contains(u.contentType().toLowerCase())) {
                throw new InvalidImageException("Chỉ nhận ảnh JPEG hoặc PNG");
            }
        }
        // Hỏi giới hạn ngay trong request: cần JWT của người dùng để gọi billing-service
        Integer max = plans.maxWardrobeItems();
        if (max != null && items.countByOwner(ownerId) >= max) {
            throw new WardrobeFullException("Tủ đồ đã đủ " + max + " món của gói hiện tại. Nâng cấp gói để thêm tiếp.");
        }
        // Đọc và chuẩn hoá ảnh ngay: ảnh hỏng báo lỗi 400 thay vì thất bại âm thầm khi chạy nền
        List<NormalizedImage> normalized = uploads.stream().map(u -> images.normalize(u.content(), u.contentType())).toList();
        Scan fresh = new Scan(UUID.randomUUID(), ownerId, ScanStatus.PROCESSING, uploads.size(), List.of(), 0, clock.instant());
        Scan scan = scans.saveUnlessDuplicate(fresh, contentHash(uploads), DUPLICATE_WINDOW);
        if (!scan.id().equals(fresh.id())) {
            log.info("Bỏ qua lần quét trùng của {}, dùng lại scan {}", ownerId, scan.id());
            return scan;
        }
        background.execute(() -> process(scan, normalized, max));
        return scan;
    }

    /**
     * Chạy nền: AI tìm món → chọn món → cắt → lưu ảnh → tạo món PENDING_REVIEW. Ảnh gốc bỏ đi sau bước này.
     * AI là phần chậm nên gọi song song mọi ảnh; chọn món theo đúng thứ tự ảnh để giới hạn của gói tính đúng,
     * rồi cắt + lưu ảnh từng món song song.
     */
    void process(Scan scan, List<NormalizedImage> photos, Integer max) {
        List<CompletableFuture<List<DetectedGarment>>> detections = photos.stream()
                .map(photo -> CompletableFuture.supplyAsync(() -> detector.detect(photo.jpeg(), "image/jpeg"), background))
                .toList();
        int skipped = 0, failedPhotos = 0, kept = 0;
        long existing = max == null ? 0 : items.countByOwner(scan.ownerId());
        List<CompletableFuture<Optional<UUID>>> saves = new ArrayList<>();
        for (int i = 0; i < photos.size(); i++) {
            Integer remaining = max == null ? null : (int) Math.max(0, max - existing - kept);
            GarmentSelection.Result chosen;
            try {
                chosen = GarmentSelection.select(detections.get(i).join(), remaining);
            } catch (CompletionException | CancellationException | NullPointerException e) {
                failedPhotos++;
                log.warn("Quét ảnh thất bại (scan {}): {}", scan.id(), (e.getCause() == null ? e : e.getCause()).toString());
                continue;
            }
            skipped += chosen.skippedForLimit();
            kept += chosen.kept().size();
            NormalizedImage photo = photos.get(i);
            for (DetectedGarment g : chosen.kept()) {
                saves.add(CompletableFuture.supplyAsync(() -> save(scan, photo, g), background));
            }
        }
        List<UUID> created = saves.stream().map(CompletableFuture::join).flatMap(Optional::stream).toList();
        ScanStatus status = failedPhotos == photos.size() ? ScanStatus.FAILED : ScanStatus.DONE;
        scans.save(new Scan(scan.id(), scan.ownerId(), status, scan.imageCount(), created, skipped, scan.createdAt()));
    }

    private Optional<UUID> save(Scan scan, NormalizedImage photo, DetectedGarment g) {
        try {
            String key = storage.store(scan.ownerId(), images.crop(photo, g.box()), "image/jpeg");
            return Optional.of(items.save(new ClothingItem(UUID.randomUUID(), scan.ownerId(), key,
                    ItemStatus.PENDING_REVIEW, g.attributes(), scan.id(), g.confidence(), clock.instant())).id());
        } catch (RuntimeException e) {
            log.warn("Lưu món đồ thất bại (scan {}): {}", scan.id(), e.toString());
            return Optional.empty();
        }
    }

    @Override
    public Optional<ScanView> scan(UUID ownerId, UUID scanId) {
        return scans.findById(scanId)
                .filter(s -> s.ownerId().equals(ownerId))
                .map(s -> new ScanView(s, items.findByScan(s.id())));
    }

    // ---------------------------------------------------------------- tủ đồ

    @Override
    public List<ClothingItem> list(UUID ownerId, Filter filter) {
        Filter f = filter == null ? new Filter(null, null) : filter;
        return items.findByOwner(ownerId, f.status()).stream()
                .filter(i -> f.category() == null || (i.attributes() != null && i.attributes().category() == f.category()))
                .toList();
    }

    @Override
    public Optional<ClothingItem> get(UUID ownerId, UUID itemId) {
        return items.findById(itemId).filter(i -> i.ownerId().equals(ownerId));
    }

    @Override
    @Transactional
    public List<ClothingItem> confirmAll(UUID ownerId, List<Confirmation> confirmations) {
        if (confirmations == null || confirmations.isEmpty() || confirmations.size() > 100) {
            throw new InvalidItemStateException("Chọn từ 1 đến 100 món mỗi lần xác nhận");
        }
        Set<UUID> ids = new HashSet<>();
        List<ClothingItem> reviewed = new ArrayList<>();
        for (Confirmation confirmation : confirmations) {
            if (confirmation == null || confirmation.itemId() == null || !ids.add(confirmation.itemId())) {
                throw new InvalidItemStateException("Danh sách món đồ không hợp lệ hoặc bị trùng");
            }
            ClothingItem item = owned(ownerId, confirmation.itemId());
            if (item.status() != ItemStatus.PENDING_REVIEW && item.status() != ItemStatus.RECOGNITION_FAILED) {
                throw new InvalidItemStateException("Có món không còn ở trạng thái chờ xác nhận. Hãy tải lại danh sách.");
            }
            reviewed.add(item.withStatus(ItemStatus.CONFIRMED, requireCategory(confirmation.attributes())));
        }
        return reviewed.stream().map(items::save).toList();
    }

    @Override
    public ClothingItem confirm(UUID ownerId, UUID itemId, ClothingAttributes attributes) {
        ClothingItem item = owned(ownerId, itemId);
        if (item.status() != ItemStatus.PENDING_REVIEW && item.status() != ItemStatus.RECOGNITION_FAILED) {
            throw new InvalidItemStateException("Món này không ở trạng thái chờ xác nhận");
        }
        return items.save(item.withStatus(ItemStatus.CONFIRMED, requireCategory(attributes)));
    }

    @Override
    public ClothingItem update(UUID ownerId, UUID itemId, ClothingAttributes attributes) {
        ClothingItem item = owned(ownerId, itemId);
        if (item.status() != ItemStatus.CONFIRMED) {
            throw new InvalidItemStateException("Chỉ sửa được món đã xác nhận; món chờ xác nhận hãy dùng xác nhận");
        }
        return items.save(item.withStatus(ItemStatus.CONFIRMED, requireCategory(attributes)));
    }

    @Override
    public void delete(UUID ownerId, UUID itemId) {
        ClothingItem item = owned(ownerId, itemId);
        items.deleteById(item.id());
        try {
            storage.delete(item.imageKey());
        } catch (RuntimeException e) {
            log.warn("Không xoá được ảnh {}: {}", item.imageKey(), e.toString()); // món đã xoá, ảnh dọn sau
        }
    }

    @Override
    @Transactional
    public List<ClothingItem> changeStatus(UUID ownerId, List<UUID> itemIds, ItemStatus status) {
        if (status == null || !ItemStatus.OWNED.contains(status)) {
            throw new InvalidItemStateException("Chỉ chuyển được sang: trong tủ, cất đi, đã bán");
        }
        List<ClothingItem> selected = ownedBatch(ownerId, itemIds);
        if (selected.stream().anyMatch(i -> !ItemStatus.OWNED.contains(i.status()))) {
            throw new InvalidItemStateException("Có món chưa xác nhận. Xác nhận món đồ trước khi cất đi hoặc đánh dấu đã bán.");
        }
        return selected.stream().map(i -> items.save(i.withStatus(status, i.attributes()))).toList();
    }

    @Override
    @Transactional
    public void deleteAll(UUID ownerId, List<UUID> itemIds) {
        List<ClothingItem> selected = ownedBatch(ownerId, itemIds);
        selected.forEach(i -> items.deleteById(i.id()));
        for (ClothingItem i : selected) {
            try {
                storage.delete(i.imageKey());
            } catch (RuntimeException e) {
                log.warn("Không xoá được ảnh {}: {}", i.imageKey(), e.toString()); // món đã xoá, ảnh dọn sau
            }
        }
    }

    private List<ClothingItem> ownedBatch(UUID ownerId, List<UUID> itemIds) {
        Set<UUID> distinct = itemIds == null ? Set.of() : new HashSet<>(itemIds);
        if (distinct.isEmpty() || itemIds.size() > MAX_ITEMS || distinct.contains(null) || distinct.size() != itemIds.size()) {
            throw new InvalidItemStateException("Chọn từ 1 đến 100 món, không trùng nhau");
        }
        return itemIds.stream().map(id -> owned(ownerId, id)).toList();
    }

    private ClothingItem owned(UUID ownerId, UUID itemId) {
        return get(ownerId, itemId).orElseThrow(() -> new ClothingItemNotFoundException("Không tìm thấy món đồ"));
    }

    private static ClothingAttributes requireCategory(ClothingAttributes a) {
        if (a == null || a.category() == null) {
            throw new InvalidItemStateException("Cần chọn loại đồ");
        }
        return a;
    }
}
