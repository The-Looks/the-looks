package vn.thelooks.wardrobe.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.net.URI;
import java.time.Clock;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.thelooks.wardrobe.application.port.out.ClothingItemRepository;
import vn.thelooks.wardrobe.application.port.out.GarmentDetector;
import vn.thelooks.wardrobe.application.port.out.ImageCropper;
import vn.thelooks.wardrobe.application.port.out.ImageStorage;
import vn.thelooks.wardrobe.application.port.out.ScanRepository;
import vn.thelooks.wardrobe.application.usecase.GetWardrobeQuery.Filter;
import vn.thelooks.wardrobe.application.usecase.ScanClothingUseCase.UploadedImage;
import vn.thelooks.wardrobe.domain.exception.InvalidImageException;
import vn.thelooks.wardrobe.domain.exception.InvalidItemStateException;
import vn.thelooks.wardrobe.domain.exception.WardrobeFullException;
import vn.thelooks.wardrobe.domain.model.BoundingBox;
import vn.thelooks.wardrobe.domain.model.Category;
import vn.thelooks.wardrobe.domain.model.ClothingAttributes;
import vn.thelooks.wardrobe.domain.model.ClothingItem;
import vn.thelooks.wardrobe.domain.model.DetectedGarment;
import vn.thelooks.wardrobe.domain.model.ItemStatus;
import vn.thelooks.wardrobe.domain.model.Scan;
import vn.thelooks.wardrobe.domain.model.ScanStatus;

/** Toàn bộ luồng với các port giả trong bộ nhớ; phần chạy nền chạy ngay (executor đồng bộ). */
class WardrobeServiceTest {

    static final UUID USER = UUID.randomUUID();

    final Map<UUID, ClothingItem> itemStore = new HashMap<>();
    final Map<UUID, Scan> scanStore = new HashMap<>();
    final List<String> deletedImages = new ArrayList<>();
    Integer planLimit = null;
    List<DetectedGarment> detections = List.of(garment(Category.TOP, 0), garment(Category.BOTTOM, 0.5));

    static DetectedGarment garment(Category c, double y) {
        return new DetectedGarment(new ClothingAttributes(c, List.of("white"), null, Set.of(), Set.of("casual")),
                new BoundingBox(0.1, y, 0.8, 0.5), 0.9);
    }

    final WardrobeService service = new WardrobeService(new ItemRepo(), new ScanRepo(),
            (GarmentDetector) (image, type) -> detections,
            new ImageCropper() {
                @Override
                public NormalizedImage normalize(byte[] image, String contentType) {
                    if (image[0] == 0) {
                        throw new InvalidImageException("hỏng");
                    }
                    return new NormalizedImage(image, 100, 100);
                }

                @Override
                public byte[] crop(NormalizedImage image, BoundingBox box) {
                    return new byte[] {1};
                }
            },
            new ImageStorage() {
                @Override
                public String store(UUID ownerId, byte[] content, String contentType) {
                    return ownerId + "/" + UUID.randomUUID() + ".jpg";
                }

                @Override
                public URI url(String key, Duration validity) {
                    return URI.create("http://img/" + key);
                }

                @Override
                public void delete(String key) {
                    deletedImages.add(key);
                }
            },
            () -> planLimit, Runnable::run, Clock.systemUTC());

    static List<UploadedImage> photos(int n) {
        return java.util.stream.IntStream.range(0, n).mapToObj(i -> new UploadedImage(new byte[] {9}, "image/jpeg")).toList();
    }

    @Test
    void onePhotoWithAnOutfitBecomesSeveralItemsToReview() {
        Scan scan = service.start(USER, photos(1));
        var view = service.scan(USER, scan.id()).orElseThrow();
        assertThat(view.scan().status()).isEqualTo(ScanStatus.DONE);
        assertThat(view.items()).extracting(i -> i.attributes().category()).containsExactly(Category.TOP, Category.BOTTOM);
        assertThat(view.items()).allMatch(i -> i.status() == ItemStatus.PENDING_REVIEW && i.scanId().equals(scan.id()));
    }

    @Test
    void stopsAtThePlanLimitAndReportsSkippedItems() {
        planLimit = 3;
        Scan scan = service.start(USER, photos(2)); // 4 món tìm được, chỉ còn 3 chỗ
        var view = service.scan(USER, scan.id()).orElseThrow();
        assertThat(view.items()).hasSize(3);
        assertThat(view.scan().skippedForLimit()).isEqualTo(1);
        assertThatThrownBy(() -> service.start(USER, photos(1))).isInstanceOf(WardrobeFullException.class);
    }

    @Test
    void validatesUploads() {
        assertThatThrownBy(() -> service.start(USER, List.of())).isInstanceOf(InvalidImageException.class);
        assertThatThrownBy(() -> service.start(USER, photos(11))).isInstanceOf(InvalidImageException.class);
        assertThatThrownBy(() -> service.start(USER, List.of(new UploadedImage(new byte[] {9}, "image/gif"))))
                .isInstanceOf(InvalidImageException.class);
        assertThatThrownBy(() -> service.start(USER, List.of(new UploadedImage(new byte[] {0}, "image/png"))))
                .isInstanceOf(InvalidImageException.class);
        assertThat(scanStore).isEmpty();
    }

    @Test
    void detectorFailureMarksScanFailed() {
        detections = null; // detect() trả null → NullPointerException trong lúc chọn món
        Scan scan = service.start(USER, photos(1));
        assertThat(service.scan(USER, scan.id()).orElseThrow().scan().status()).isEqualTo(ScanStatus.FAILED);
    }

    @Test
    void sameUploadSentTwiceIsScannedOnce() {
        Scan first = service.start(USER, photos(1));
        Scan again = service.start(USER, photos(1));
        assertThat(again.id()).isEqualTo(first.id());
        assertThat(itemStore).hasSize(2); // 2 món của lần đầu, không tách lại
        assertThat(service.start(USER, List.of(new UploadedImage(new byte[] {7}, "image/jpeg"))).id())
                .isNotEqualTo(first.id());
    }

    @Test
    void confirmUpdateDeleteAndOwnership() {
        Scan scan = service.start(USER, photos(1));
        ClothingItem item = service.scan(USER, scan.id()).orElseThrow().items().getFirst();
        var edited = new ClothingAttributes(Category.OUTERWEAR, List.of("beige"), "linen", Set.of(), Set.of("minimal"));

        assertThatThrownBy(() -> service.update(USER, item.id(), edited)).isInstanceOf(InvalidItemStateException.class);
        assertThat(service.confirm(USER, item.id(), edited).status()).isEqualTo(ItemStatus.CONFIRMED);
        assertThatThrownBy(() -> service.confirm(USER, item.id(), edited)).isInstanceOf(InvalidItemStateException.class);
        assertThat(service.list(USER, new Filter(ItemStatus.CONFIRMED, Category.OUTERWEAR))).hasSize(1);
        assertThat(service.get(UUID.randomUUID(), item.id())).isEmpty();

        service.delete(USER, item.id());
        assertThat(service.get(USER, item.id())).isEmpty();
        assertThat(deletedImages).containsExactly(item.imageKey());
    }

    class ItemRepo implements ClothingItemRepository {
        public ClothingItem save(ClothingItem item) { itemStore.put(item.id(), item); return item; }
        public Optional<ClothingItem> findById(UUID id) { return Optional.ofNullable(itemStore.get(id)); }
        public List<ClothingItem> findByOwner(UUID ownerId, ItemStatus status) {
            return itemStore.values().stream().filter(i -> i.ownerId().equals(ownerId) && (status == null || i.status() == status)).toList();
        }
        public void deleteById(UUID id) { itemStore.remove(id); }
        public long countByOwner(UUID ownerId) { return findByOwner(ownerId, null).size(); }
        public List<ClothingItem> findByScan(UUID scanId) {
            return itemStore.values().stream().filter(i -> scanId.equals(i.scanId()))
                    .sorted(java.util.Comparator.comparing(i -> i.attributes().category())).toList();
        }
    }

    class ScanRepo implements ScanRepository {
        final Map<String, UUID> byHash = new HashMap<>();
        public Scan save(Scan scan) { scanStore.put(scan.id(), scan); return scan; }
        public Scan saveUnlessDuplicate(Scan scan, String hash, Duration window) {
            UUID old = byHash.get(hash);
            if (old != null) return scanStore.get(old);
            byHash.put(hash, scan.id());
            return save(scan);
        }
        public Optional<Scan> findById(UUID id) { return Optional.ofNullable(scanStore.get(id)); }
    }
}
