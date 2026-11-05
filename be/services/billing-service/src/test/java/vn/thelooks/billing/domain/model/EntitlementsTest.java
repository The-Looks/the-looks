package vn.thelooks.billing.domain.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;

/** Nhắc trước 3 ngày, ân hạn 3 ngày khi bật tự gia hạn. */
class EntitlementsTest {

    static final Instant EXPIRES = Instant.parse("2026-12-01T03:00:00Z");

    static Entitlements at(long hoursFromExpiry, boolean autoRenew) {
        var sub = new Subscription(UUID.randomUUID(), Plan.PLUS, BillingPeriod.MONTHLY, EXPIRES, autoRenew);
        return Entitlements.of(sub, EXPIRES.plus(Duration.ofHours(hoursFromExpiry)));
    }

    @Test
    void activeWellBeforeExpiry() {
        var e = at(-4 * 24, true);
        assertThat(e.plan()).isEqualTo(Plan.PLUS);
        assertThat(e.status()).isEqualTo(Subscription.Status.ACTIVE);
    }

    @Test
    void remindsWithinThreeDaysOfExpiry() {
        assertThat(at(-3 * 24, true).status()).isEqualTo(Subscription.Status.RENEWAL_DUE);
        assertThat(at(-1, true).status()).isEqualTo(Subscription.Status.RENEWAL_DUE);
        assertThat(at(-2 * 24, false).status()).isEqualTo(Subscription.Status.RENEWAL_DUE);
    }

    @Test
    void autoRenewKeepsPlanDuringGrace() {
        var e = at(24, true);
        assertThat(e.plan()).isEqualTo(Plan.PLUS);
        assertThat(e.status()).isEqualTo(Subscription.Status.GRACE);
        assertThat(e.expiresAt()).isEqualTo(EXPIRES);
    }

    @Test
    void graceEndsAfterThreeDays() {
        assertThat(at(3 * 24, true).plan()).isEqualTo(Plan.FREE);
    }

    @Test
    void cancelledAutoRenewEndsAtExpiry() {
        assertThat(at(-1, false).plan()).isEqualTo(Plan.PLUS);
        var e = at(0, false);
        assertThat(e.plan()).isEqualTo(Plan.FREE);
        assertThat(e.status()).isNull();
        assertThat(e.autoRenew()).isFalse();
    }

    @Test
    void noSubscriptionIsFree() {
        assertThat(Entitlements.of(null, EXPIRES).plan()).isEqualTo(Plan.FREE);
    }
}
