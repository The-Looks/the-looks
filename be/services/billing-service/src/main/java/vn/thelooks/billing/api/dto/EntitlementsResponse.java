package vn.thelooks.billing.api.dto;

import java.time.Instant;
import java.util.Set;
import vn.thelooks.billing.domain.model.Entitlements;
import vn.thelooks.billing.domain.model.Feature;
import vn.thelooks.billing.domain.model.Plan;

public record EntitlementsResponse(Plan plan, Instant expiresAt, PlanResponse.Limits limits, Set<Feature> features) {

    public static EntitlementsResponse from(Entitlements e) {
        return new EntitlementsResponse(e.plan(), e.expiresAt(), PlanResponse.Limits.of(e.plan()), e.features());
    }
}
