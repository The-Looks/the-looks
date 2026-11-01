package vn.thelooks.billing.api.dto;

import jakarta.validation.constraints.NotNull;
import vn.thelooks.billing.domain.model.BillingPeriod;
import vn.thelooks.billing.domain.model.Plan;

public record CheckoutRequest(@NotNull Plan plan, @NotNull BillingPeriod period) {
}
