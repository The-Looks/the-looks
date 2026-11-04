package vn.thelooks.billing.domain.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.thelooks.billing.domain.model.BillingPeriod;
import vn.thelooks.billing.domain.model.Plan;
import vn.thelooks.billing.domain.model.Subscription;

class SubscriptionCalculatorTest {

    // 01/11/2026 10:00 giờ Việt Nam
    static final Instant NOW = Instant.parse("2026-11-01T03:00:00Z");
    static final UUID USER = UUID.randomUUID();

    @Test
    void newMonthlyPlanStartsNow() {
        assertThat(SubscriptionCalculator.newExpiry(null, Plan.PLUS, BillingPeriod.MONTHLY, NOW))
                .isEqualTo(Instant.parse("2026-12-01T03:00:00Z"));
    }

    @Test
    void yearlyPlanLastsTwelveMonths() {
        assertThat(SubscriptionCalculator.newExpiry(null, Plan.PRO, BillingPeriod.YEARLY, NOW))
                .isEqualTo(Instant.parse("2027-11-01T03:00:00Z"));
    }

    @Test
    void renewingSamePlanExtendsFromCurrentExpiry() {
        var current = new Subscription(USER, Plan.PLUS, Instant.parse("2026-11-20T03:00:00Z"));
        assertThat(SubscriptionCalculator.newExpiry(current, Plan.PLUS, BillingPeriod.MONTHLY, NOW))
                .isEqualTo(Instant.parse("2026-12-20T03:00:00Z"));
    }

    @Test
    void expiredPlanStartsFromNow() {
        var expired = new Subscription(USER, Plan.PLUS, NOW.minus(Duration.ofDays(3)));
        assertThat(SubscriptionCalculator.newExpiry(expired, Plan.PLUS, BillingPeriod.MONTHLY, NOW))
                .isEqualTo(Instant.parse("2026-12-01T03:00:00Z"));
    }

    @Test
    void upgradingConvertsRemainingPlusTimeIntoProTime() {
        // Còn 30 ngày Plus (49.000đ) → đổi sang Pro (89.000đ) được 30 × 49/89 ≈ 16,5 ngày cộng thêm
        var current = new Subscription(USER, Plan.PLUS, NOW.plus(Duration.ofDays(30)));
        Instant expiry = SubscriptionCalculator.newExpiry(current, Plan.PRO, BillingPeriod.MONTHLY, NOW);
        Duration bonus = Duration.between(Instant.parse("2026-12-01T03:00:00Z"), expiry);
        assertThat(bonus.toHours()).isBetween(396L, 397L);
    }

    @Test
    void downgradingGivesMoreTime() {
        var current = new Subscription(USER, Plan.PRO, NOW.plus(Duration.ofDays(10)));
        Instant expiry = SubscriptionCalculator.newExpiry(current, Plan.PLUS, BillingPeriod.MONTHLY, NOW);
        Duration bonus = Duration.between(Instant.parse("2026-12-01T03:00:00Z"), expiry);
        assertThat(bonus.toDays()).isEqualTo(18); // 10 × 89/49 ≈ 18,2 ngày
    }

    @Test
    void freePlanCannotBeBought() {
        assertThatThrownBy(() -> SubscriptionCalculator.newExpiry(null, Plan.FREE, BillingPeriod.MONTHLY, NOW))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
