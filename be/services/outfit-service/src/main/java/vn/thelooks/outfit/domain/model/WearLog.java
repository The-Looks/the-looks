package vn.thelooks.outfit.domain.model;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Một lần mặc outfit. Quick Pick dựa vào đây để biết món nào lâu chưa mặc. */
public record WearLog(
        UUID id,
        UUID ownerId,
        UUID outfitId,
        List<UUID> itemIds,
        Instant wornAt) {
}
