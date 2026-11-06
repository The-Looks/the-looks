package vn.thelooks.wardrobe.application.usecase;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import vn.thelooks.wardrobe.domain.model.ClothingItem;

public interface GetWardrobeStatsQuery {
    record Count(String key, long count) {}
    record UnusedItem(ClothingItem item, Instant lastWornAt, Long daysSinceWear) {}
    record Stats(long totalItems, long wornItems, long neverWornItems, double wearRatePercent,
            List<Count> byCategory, List<Count> byColor, long inactiveCount, int inactiveAfterDays,
            List<UnusedItem> unusedItems, Instant asOf) {}
    Stats stats(UUID ownerId);
}
