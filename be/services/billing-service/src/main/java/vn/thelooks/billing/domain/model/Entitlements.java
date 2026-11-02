package vn.thelooks.billing.domain.model;

import java.time.Instant;
import java.util.Set;

/** Quyền lợi đang có. Với FREE: expiresAt, period, status là null và autoRenew = false. */
public record Entitlements(Plan plan, Instant expiresAt, BillingPeriod period, boolean autoRenew,
        Subscription.Status status) {

    public static Entitlements of(Subscription subscription, Instant now) {
        return subscription != null && subscription.activeAt(now)
                ? new Entitlements(subscription.plan(), subscription.expiresAt(), subscription.period(),
                        subscription.autoRenew(), subscription.statusAt(now))
                : new Entitlements(Plan.FREE, null, null, false, null);
    }

    public Set<Feature> features() {
        return plan.features();
    }
}
