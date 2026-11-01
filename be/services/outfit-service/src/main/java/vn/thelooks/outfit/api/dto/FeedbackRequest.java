package vn.thelooks.outfit.api.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;
import vn.thelooks.outfit.domain.model.Feedback;

public record FeedbackRequest(@NotEmpty @Size(max = 10) List<@NotNull UUID> itemIds, @NotNull Feedback vote) {
}
