package vn.thelooks.wardrobe.application.usecase;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import vn.thelooks.wardrobe.domain.model.Category;
import vn.thelooks.wardrobe.domain.model.ClothingItem;
import vn.thelooks.wardrobe.domain.model.ItemStatus;

public interface GetWardrobeQuery {

    /** Các field của filter để null = không lọc theo field đó. */
    List<ClothingItem> list(UUID ownerId, Filter filter);

    Optional<ClothingItem> get(UUID ownerId, UUID itemId);

    record Filter(ItemStatus status, Category category) {
    }
}
