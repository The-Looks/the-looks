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
        var current = sub(Plan.PLUS, Instant.parse("2026-11-20T03:00:00Z"));
        assertThat(SubscriptionCalculator.newExpiry(current, Plan.PLUS, BillingPeriod.MONTHLY, NOW))
                .isEqualTo(Instant.parse("2026-12-20T03:00:00Z"));
    }

    @Test
    void planExpiredPastGraceStartsFromNow() {
        var expired = sub(Plan.PLUS, NOW.minus(Duration.ofDays(4)));
        assertThat(SubscriptionCalculator.newExpiry(expired, Plan.PLUS, BillingPeriod.MONTHLY, NOW))
                .isEqualTo(Instant.parse("2026-12-01T03:00:00Z"));
    }

    @Test
    void upgradingConvertsRemainingPlusTimeIntoProTime() {
        // Còn 30 ngày Plus (49.000đ) → đổi sang Pro (79.000đ) được 30 × 49/79 ≈ 18,6 ngày cộng thêm
        var current = sub(Plan.PLUS, NOW.plus(Duration.ofDays(30)));
        Instant expiry = SubscriptionCalculator.newExpiry(current, Plan.PRO, BillingPeriod.MONTHLY, NOW);
        Duration bonus = Duration.between(Instant.parse("2026-12-01T03:00:00Z"), expiry);
        assertThat(bonus.toHours()).isBetween(446L, 447L);
    }

    @Test
    void downgradingGivesMoreTime() {
        var current = sub(Plan.PRO, NOW.plus(Duration.ofDays(10)));
        Instant expiry = SubscriptionCalculator.newExpiry(current, Plan.PLUS, BillingPeriod.MONTHLY, NOW);
        Duration bonus = Duration.between(Instant.parse("2026-12-01T03:00:00Z"), expiry);
        assertThat(bonus.toDays()).isEqualTo(16); // 10 × 79/49 ≈ 16,1 ngày
    }

    @Test
    void renewingDuringGraceExtendsFromOldExpirySoGraceIsNotFree() {
        var inGrace = sub(Plan.PLUS, NOW.minus(Duration.ofDays(1)));
        assertThat(SubscriptionCalculator.newExpiry(inGrace, Plan.PLUS, BillingPeriod.MONTHLY, NOW))
                .isEqualTo(Instant.parse("2026-11-30T03:00:00Z"));
    }

    @Test
    void switchingPlanDuringGraceGivesNoNegativeCredit() {
        var inGrace = sub(Plan.PRO, NOW.minus(Duration.ofDays(1)));
        assertThat(SubscriptionCalculator.newExpiry(inGrace, Plan.PLUS, BillingPeriod.MONTHLY, NOW))
                .isEqualTo(Instant.parse("2026-12-01T03:00:00Z"));
    }

    @Test
    void freePlanCannotBeBought() {
        assertThatThrownBy(() -> SubscriptionCalculator.newExpiry(null, Plan.FREE, BillingPeriod.MONTHLY, NOW))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void refundRemovesTheMonthsOfThatOrder() {
        // Mua 2 tháng Plus liên tiếp → hết hạn 01/01/2027; hoàn 1 đơn → còn tới 01/12/2026
        var twoMonths = sub(Plan.PLUS, Instant.parse("2027-01-01T03:00:00Z"));
        assertThat(SubscriptionCalculator.expiryAfterRefund(twoMonths, Plan.PLUS, BillingPeriod.MONTHLY, NOW))
                .contains(Instant.parse("2026-12-01T03:00:00Z"));
    }

    @Test
    void refundingTheOnlyOrderEndsThePlanNow() {
        var oneMonth = sub(Plan.PLUS, Instant.parse("2026-11-20T03:00:00Z"));
        assertThat(SubscriptionCalculator.expiryAfterRefund(oneMonth, Plan.PLUS, BillingPeriod.MONTHLY, NOW)).contains(NOW);
    }

    @Test
    void refundAfterSwitchingPlanIsLeftToTheAdmin() {
        var pro = sub(Plan.PRO, Instant.parse("2026-12-20T03:00:00Z"));
        assertThat(SubscriptionCalculator.expiryAfterRefund(pro, Plan.PLUS, BillingPeriod.MONTHLY, NOW)).isEmpty();
        assertThat(SubscriptionCalculator.expiryAfterRefund(null, Plan.PLUS, BillingPeriod.MONTHLY, NOW)).isEmpty();
    }

    private static Subscription sub(Plan plan, Instant expiresAt) {
        return new Subscription(USER, plan, BillingPeriod.MONTHLY, expiresAt, true);
    }
}
