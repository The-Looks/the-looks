package vn.thelooks.outfit.domain;

import java.net.URI;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

/** Món đồ nhìn từ góc độ module outfit (bản sao chỉ-đọc từ wardrobe). */
public record ClosetItem(
        UUID id,
        String category,
        List<String> colors,
        Set<String> seasons,
        Set<String> styleTags,
        URI imageUrl) {

    public ClosetItem {
        Objects.requireNonNull(id, "id");
        category = category == null ? "" : category;
        colors = colors == null ? List.of() : List.copyOf(colors);
        seasons = seasons == null ? Set.of() : Set.copyOf(seasons);
        styleTags = styleTags == null ? Set.of() : Set.copyOf(styleTags);
    }
}
