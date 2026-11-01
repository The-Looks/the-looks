package vn.thelooks.wardrobe.domain.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import vn.thelooks.wardrobe.domain.model.DetectedGarment;

/**
 * Chọn món nào được tạo từ kết quả AI của một ảnh: bỏ nhiễu, bỏ món bị báo trùng, giới hạn số món,
 * và không vượt số món còn trống trong tủ theo gói.
 */
public final class GarmentSelection {

    /** Ảnh đông đồ quá thì nhiều khả năng là ảnh cửa hàng hoặc nhận nhầm. */
    public static final int MAX_ITEMS_PER_IMAGE = 8;
    static final double MIN_CONFIDENCE = 0.3;
    static final double DUPLICATE_OVERLAP = 0.6;

    private GarmentSelection() {
    }

    /**
     * @param remainingSlots số món còn được thêm theo gói; null = không giới hạn
     */
    public static Result select(List<DetectedGarment> detected, Integer remainingSlots) {
        List<DetectedGarment> candidates = detected.stream()
                .filter(g -> g.confidence() >= MIN_CONFIDENCE && !g.box().tooSmall())
                .sorted(Comparator.comparingDouble(DetectedGarment::confidence).reversed())
                .toList();
        List<DetectedGarment> unique = new ArrayList<>();
        for (DetectedGarment g : candidates) {
            if (unique.stream().noneMatch(u -> u.box().overlap(g.box()) > DUPLICATE_OVERLAP)) {
                unique.add(g);
            }
        }
        List<DetectedGarment> capped = unique.subList(0, Math.min(unique.size(), MAX_ITEMS_PER_IMAGE));
        int allowed = remainingSlots == null ? capped.size() : Math.max(0, Math.min(remainingSlots, capped.size()));
        return new Result(List.copyOf(capped.subList(0, allowed)), capped.size() - allowed);
    }

    /** @param skippedForLimit số món hợp lệ không tạo vì hết chỗ trong gói */
    public record Result(List<DetectedGarment> kept, int skippedForLimit) {
    }
}
