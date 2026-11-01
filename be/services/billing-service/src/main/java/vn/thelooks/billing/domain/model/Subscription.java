package vn.thelooks.billing.domain.model;

import java.time.Instant;
import java.util.UUID;

/** Gói trả phí hiện tại của một người. Hết hạn thì coi như FREE. */
public record Subscription(UUID ownerId, Plan plan, Instant expiresAt) {

    public boolean activeAt(Instant now) {
        return now.isBefore(expiresAt);
    }
}
