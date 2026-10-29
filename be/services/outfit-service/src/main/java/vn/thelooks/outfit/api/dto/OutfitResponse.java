package vn.thelooks.outfit.api.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import vn.thelooks.outfit.domain.model.Occasion;
import vn.thelooks.outfit.domain.model.Outfit;

public record OutfitResponse(UUID id, List<UUID> itemIds, Occasion occasion, Instant createdAt) {

    public static OutfitResponse from(Outfit o) {
        return new OutfitResponse(o.id(), o.itemIds(), o.occasion(), o.createdAt());
    }
}
