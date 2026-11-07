package vn.thelooks.wardrobe.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;

public record ConfirmItemsRequest(@NotNull @Size(min = 1, max = 100) List<@NotNull @Valid Item> items) {
    public record Item(@NotNull UUID itemId, @NotNull @Valid AttributesRequest attributes) {}
}
