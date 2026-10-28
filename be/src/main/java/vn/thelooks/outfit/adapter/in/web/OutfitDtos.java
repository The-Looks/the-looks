package vn.thelooks.outfit.adapter.in.web;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import vn.thelooks.outfit.domain.ClosetItem;
import vn.thelooks.outfit.domain.Occasion;
import vn.thelooks.outfit.domain.Outfit;
import vn.thelooks.outfit.domain.OutfitSuggestion;

/** Request/response của OutfitController, khớp contracts/openapi.yaml. */
final class OutfitDtos {

    private OutfitDtos() {
    }

    record SaveOutfitRequest(@NotEmpty @Size(max = 10) List<@NotNull UUID> itemIds, Occasion occasion) {
    }

    record ItemResponse(UUID id, String category, URI imageUrl) {
        static ItemResponse from(ClosetItem item) {
            return new ItemResponse(item.id(), item.category(), item.imageUrl());
        }
    }

    record SuggestionResponse(List<ItemResponse> items, Occasion occasion, double score, String reason) {
        static SuggestionResponse from(OutfitSuggestion s) {
            return new SuggestionResponse(s.items().stream().map(ItemResponse::from).toList(),
                    s.occasion(), s.score(), s.reason());
        }
    }

    record OutfitResponse(UUID id, List<UUID> itemIds, Occasion occasion, Instant createdAt) {
        static OutfitResponse from(Outfit o) {
            return new OutfitResponse(o.id(), o.itemIds(), o.occasion(), o.createdAt());
        }
    }
}
