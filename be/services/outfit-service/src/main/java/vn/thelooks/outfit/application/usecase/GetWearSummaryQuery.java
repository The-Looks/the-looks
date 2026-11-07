package vn.thelooks.outfit.application.usecase;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface GetWearSummaryQuery {
    record ItemWear(UUID itemId, long wearCount, Instant lastWornAt) {}
    List<ItemWear> summary(UUID ownerId);
}
