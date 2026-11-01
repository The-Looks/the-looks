package vn.thelooks.billing.domain.model;

import java.time.Instant;
import java.util.Set;

/** Quyền lợi đang có. expiresAt null với FREE. */
public record Entitlements(Plan plan, Instant expiresAt) {

    public static Entitlements of(Subscription subscription, Instant now) {
        return subscription != null && subscription.activeAt(now)
                ? new Entitlements(subscription.plan(), subscription.expiresAt())
                : new Entitlements(Plan.FREE, null);
    }

    public Set<Feature> features() {
        return plan.features();
    }
}
