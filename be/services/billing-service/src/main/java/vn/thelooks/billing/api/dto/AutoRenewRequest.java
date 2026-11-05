package vn.thelooks.billing.api.dto;

import jakarta.validation.constraints.NotNull;

public record AutoRenewRequest(@NotNull Boolean enabled) {
}
