package vn.thelooks.wardrobe.application.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import vn.thelooks.wardrobe.domain.ClothingItem;
import vn.thelooks.wardrobe.domain.ItemStatus;

public interface ClothingItemRepository {

    ClothingItem save(ClothingItem item);

    Optional<ClothingItem> findById(UUID id);

    List<ClothingItem> findByOwner(UUID ownerId, ItemStatus status);

    void deleteById(UUID id);
}
