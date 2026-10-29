package vn.thelooks.outfit.api.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;
import vn.thelooks.outfit.domain.model.Occasion;

/** @param occasion có thể null */
public record SaveOutfitRequest(@NotEmpty @Size(max = 10) List<@NotNull UUID> itemIds, Occasion occasion) {
}
