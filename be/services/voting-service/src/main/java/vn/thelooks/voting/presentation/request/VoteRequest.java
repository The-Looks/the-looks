package vn.thelooks.voting.presentation.request;

import jakarta.validation.constraints.NotNull;
import vn.thelooks.voting.domain.enums.Choice;

public record VoteRequest(@NotNull Choice choice) {
}
