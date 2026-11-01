package vn.thelooks.wardrobe.api.dto;

import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import vn.thelooks.wardrobe.domain.model.Category;
import vn.thelooks.wardrobe.domain.model.ClothingAttributes;
import vn.thelooks.wardrobe.domain.model.ClothingItem;
import vn.thelooks.wardrobe.domain.model.ItemStatus;
import vn.thelooks.wardrobe.domain.model.Season;

/** Schema WardrobeItem trong wardrobe-api.yaml; outfit-service đọc id, category, colors, seasons, styleTags, imageUrl. */
public record ItemResponse(UUID id, ItemStatus status, Category category, List<String> colors, String material,
        Set<Season> seasons, Set<String> styleTags, URI imageUrl, UUID scanId, Double confidence, Instant createdAt) {

    public static ItemResponse from(ClothingItem i, URI imageUrl) {
        ClothingAttributes a = i.attributes();
        return new ItemResponse(i.id(), i.status(), a == null ? null : a.category(), a == null ? List.of() : a.colors(),
                a == null ? null : a.material(), a == null ? Set.of() : a.seasons(), a == null ? Set.of() : a.styleTags(),
                imageUrl, i.scanId(), i.confidence(), i.createdAt());
    }
}
