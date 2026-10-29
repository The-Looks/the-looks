package vn.thelooks.outfit.api.dto;

import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import vn.thelooks.outfit.domain.model.Occasion;
import vn.thelooks.outfit.domain.model.OutfitView;

public record OutfitDetailResponse(UUID id, List<UUID> itemIds, Occasion occasion, Instant createdAt,
        List<URI> itemImageUrls) {

    public static OutfitDetailResponse from(OutfitView v) {
        var o = v.outfit();
        return new OutfitDetailResponse(o.id(), o.itemIds(), o.occasion(), o.createdAt(), v.itemImageUrls());
    }
}
