package vn.thelooks.wardrobe.domain.model;

import java.time.Instant;
import java.util.UUID;

/**
 * Một món đồ trong tủ.
 *
 * @param imageKey   khoá ảnh trong ImageStorage (không phải URL)
 * @param attributes null khi đang PROCESSING
 * @param scanId     lần quét tạo ra món này; null nếu thêm tay
 * @param confidence độ tin cậy của AI 0..1; null nếu người dùng tự nhập
 */
public record ClothingItem(
        UUID id,
        UUID ownerId,
        String imageKey,
        ItemStatus status,
        ClothingAttributes attributes,
        UUID scanId,
        Double confidence,
        Instant createdAt) {


    public ClothingItem withStatus(ItemStatus newStatus, ClothingAttributes newAttributes) {
        return new ClothingItem(id, ownerId, imageKey, newStatus, newAttributes, scanId, confidence, createdAt);
    }
}
