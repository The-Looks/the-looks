package vn.thelooks.wardrobe.application.service;

import java.time.Clock;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Executor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
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
        DeleteClothingItemUseCase {

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
        Scan scan = scans.save(new Scan(UUID.randomUUID(), ownerId, ScanStatus.PROCESSING, uploads.size(), List.of(), 0,
                clock.instant()));
        background.execute(() -> process(scan, normalized, max));
        return scan;
    }

    /** Chạy nền: AI tìm món → chọn món → cắt → lưu ảnh → tạo món PENDING_REVIEW. Ảnh gốc bỏ đi sau bước này. */
    void process(Scan scan, List<NormalizedImage> photos, Integer max) {
        int skipped = 0, failedPhotos = 0;
        List<UUID> created = new ArrayList<>();
        for (NormalizedImage photo : photos) {
            try {
                List<DetectedGarment> detected = detector.detect(photo.jpeg(), "image/jpeg");
                Integer remaining = max == null ? null : (int) Math.max(0, max - items.countByOwner(scan.ownerId()));
                GarmentSelection.Result chosen = GarmentSelection.select(detected, remaining);
                skipped += chosen.skippedForLimit();
                for (DetectedGarment g : chosen.kept()) {
                    String key = storage.store(scan.ownerId(), images.crop(photo, g.box()), "image/jpeg");
                    ClothingItem item = items.save(new ClothingItem(UUID.randomUUID(), scan.ownerId(), key,
                            ItemStatus.PENDING_REVIEW, g.attributes(), scan.id(), g.confidence(), clock.instant()));
                    created.add(item.id());
                }
            } catch (RuntimeException e) {
                failedPhotos++;
                log.warn("Quét ảnh thất bại (scan {}): {}", scan.id(), e.toString());
            }
        }
        ScanStatus status = failedPhotos == photos.size() ? ScanStatus.FAILED : ScanStatus.DONE;
        scans.save(new Scan(scan.id(), scan.ownerId(), status, scan.imageCount(), created, skipped, scan.createdAt()));
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
