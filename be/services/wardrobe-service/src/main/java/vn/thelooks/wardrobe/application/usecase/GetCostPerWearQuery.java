package vn.thelooks.wardrobe.application.usecase;

import java.util.List;
import java.util.UUID;
import vn.thelooks.wardrobe.domain.model.ClothingItem;
import vn.thelooks.wardrobe.domain.model.CostPerWear;

public interface GetCostPerWearQuery {
    record Entry(ClothingItem item, CostPerWear cost) {}
    record Summary(List<Entry> items, long totalItems) {}
    Entry item(UUID ownerId, UUID itemId);
    Summary summary(UUID ownerId);
}
