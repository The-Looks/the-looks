package vn.thelooks.wardrobe.domain.model;

import java.time.Instant;
import java.util.UUID;

/**
 * Một món đồ trong tủ.
 *
 * @param imageKey   khoá ảnh trong ImageStorage (không phải URL)
 * @param attributes null khi đang PROCESSING
 */
public record ClothingItem(
        UUID id,
        UUID ownerId,
        String imageKey,
        ItemStatus status,
        ClothingAttributes attributes,
        Instant createdAt) {
}
