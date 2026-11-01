package vn.thelooks.voting.presentation.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record CreatePollRequest(@NotNull UUID outfitAId, @NotNull UUID outfitBId,
        @Size(max = 140) String question, @Min(1) @Max(168) Integer ttlHours) {
}
