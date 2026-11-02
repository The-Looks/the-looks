package vn.thelooks.billing.api.dto;

import java.time.Instant;
import java.util.Set;
import vn.thelooks.billing.domain.model.BillingPeriod;
import vn.thelooks.billing.domain.model.Entitlements;
import vn.thelooks.billing.domain.model.Feature;
import vn.thelooks.billing.domain.model.Plan;
import vn.thelooks.billing.domain.model.Subscription;

public record EntitlementsResponse(Plan plan, Instant expiresAt, BillingPeriod period, boolean autoRenew,
        Subscription.Status status, PlanResponse.Limits limits, Set<Feature> features) {

    public static EntitlementsResponse from(Entitlements e) {
        return new EntitlementsResponse(e.plan(), e.expiresAt(), e.period(), e.autoRenew(), e.status(),
                PlanResponse.Limits.of(e.plan()), e.features());
    }
}
