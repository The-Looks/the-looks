package vn.thelooks.wardrobe.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Set;
import vn.thelooks.wardrobe.domain.model.Category;
import vn.thelooks.wardrobe.domain.model.ClothingAttributes;
import vn.thelooks.wardrobe.domain.model.Season;

public record AttributesRequest(@NotNull Category category, @Size(max = 5) List<@Size(max = 30) String> colors,
        @Size(max = 60) String material, Set<Season> seasons, @Size(max = 8) Set<@Size(max = 30) String> styleTags) {

    public ClothingAttributes toDomain() {
        return new ClothingAttributes(category, colors == null ? List.of() : colors, material,
                seasons == null ? Set.of() : seasons, styleTags == null ? Set.of() : styleTags);
    }
}
