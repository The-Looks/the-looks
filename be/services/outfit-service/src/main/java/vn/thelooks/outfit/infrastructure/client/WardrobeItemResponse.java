package vn.thelooks.outfit.infrastructure.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.net.URI;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import vn.thelooks.outfit.domain.model.ClosetItem;

/** Một phần của schema WardrobeItem trong wardrobe-api.yaml — chỉ lấy field outfit cần. */
@JsonIgnoreProperties(ignoreUnknown = true)
record WardrobeItemResponse(
        UUID id,
        String category,
        List<String> colors,
        Set<String> seasons,
        Set<String> styleTags,
        URI imageUrl) {

    ClosetItem toClosetItem() {
        return new ClosetItem(id, category, colors, seasons, styleTags, imageUrl);
    }
}
