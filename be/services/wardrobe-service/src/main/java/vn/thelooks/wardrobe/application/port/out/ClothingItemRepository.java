package vn.thelooks.wardrobe.application.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import vn.thelooks.wardrobe.domain.model.ClothingItem;
import vn.thelooks.wardrobe.domain.model.ItemStatus;

public interface ClothingItemRepository {

    ClothingItem save(ClothingItem item);

    Optional<ClothingItem> findById(UUID id);

    /** status null = mọi món còn trong tủ (trừ ARCHIVED, SOLD). */
    List<ClothingItem> findByOwner(UUID ownerId, ItemStatus status);

    void deleteById(UUID id);

    /** Số món đang có (mọi trạng thái trừ RECOGNITION_FAILED và SOLD), để so với giới hạn của gói. */
    long countByOwner(UUID ownerId);

    List<ClothingItem> findByScan(UUID scanId);
}
