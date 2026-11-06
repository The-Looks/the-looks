package vn.thelooks.billing.domain.service;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Optional;
import vn.thelooks.billing.domain.model.BillingPeriod;
import vn.thelooks.billing.domain.model.Plan;
import vn.thelooks.billing.domain.model.Subscription;

/**
 * Ngày hết hạn mới sau khi thanh toán.
 * <ul>
 *   <li>Chưa có gói / đã hết hạn: tính từ bây giờ.</li>
 *   <li>Gia hạn cùng gói (kể cả trong thời gian ân hạn): cộng tiếp vào ngày hết hạn cũ, nên ân hạn không thành ngày miễn phí.</li>
 *   <li>Đổi gói khi gói cũ còn hạn: thời gian còn lại quy ra tiền theo giá tháng của gói cũ,
 *       rồi đổi sang thời gian của gói mới, cộng thêm vào. Không ai mất tiền khi nâng hoặc hạ gói.</li>
 * </ul>
 */
public final class SubscriptionCalculator {

    static final ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");
    /** Quy đổi giá tháng ra giá theo giây. */
    static final long SECONDS_PER_MONTH = Duration.ofDays(30).toSeconds();

    private SubscriptionCalculator() {
    }

    public static Instant newExpiry(Subscription current, Plan plan, BillingPeriod period, Instant now) {
        if (!plan.paid()) {
            throw new IllegalArgumentException("Không mua được gói Free");
        }
        boolean active = current != null && current.activeAt(now);
        if (active && current.plan() == plan) {
            return addMonths(current.expiresAt(), period.months());
        }
        Instant base = addMonths(now, period.months());
        if (!active) {
            return base;
        }
        // Đổi gói trong thời gian ân hạn: không còn thời gian để quy đổi
        long remainingSeconds = Math.max(0, Duration.between(now, current.expiresAt()).toSeconds());
        double creditVnd = remainingSeconds * (double) current.plan().monthlyPriceVnd() / SECONDS_PER_MONTH;
        long creditSeconds = Math.round(creditVnd * SECONDS_PER_MONTH / plan.monthlyPriceVnd());
        return base.plusSeconds(creditSeconds);
    }

    /**
     * Hạn gói sau khi hoàn tiền một đơn: trừ lại đúng số tháng của đơn đó. Trừ xong mà đã qua thì gói kết thúc ngay
     * (trả {@code now}). Rỗng khi gói hiện tại khác gói của đơn (người dùng đã đổi gói sau đó): admin xử lý tay.
     */
    // ponytail: không quy đổi ngược khi đã đổi gói sau đơn bị hoàn; thêm khi có ca thật cần
    public static Optional<Instant> expiryAfterRefund(Subscription current, Plan plan, BillingPeriod period, Instant now) {
        if (current == null || current.plan() != plan) {
            return Optional.empty();
        }
        Instant reduced = addMonths(current.expiresAt(), -period.months());
        return Optional.of(reduced.isAfter(now) ? reduced : now);
    }

    private static Instant addMonths(Instant from, int months) {
        return ZonedDateTime.ofInstant(from, VIETNAM).plusMonths(months).toInstant();
    }
}
