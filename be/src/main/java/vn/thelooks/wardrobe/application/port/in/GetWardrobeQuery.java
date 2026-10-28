package vn.thelooks.wardrobe.application.port.in;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import vn.thelooks.wardrobe.domain.Category;
import vn.thelooks.wardrobe.domain.ClothingItem;
import vn.thelooks.wardrobe.domain.ItemStatus;

public interface GetWardrobeQuery {

    /** Các field của filter để null = không lọc theo field đó. */
    List<ClothingItem> list(UUID ownerId, Filter filter);

    Optional<ClothingItem> get(UUID ownerId, UUID itemId);

    record Filter(ItemStatus status, Category category) {
    }
}
