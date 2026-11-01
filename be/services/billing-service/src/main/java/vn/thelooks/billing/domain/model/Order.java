package vn.thelooks.billing.domain.model;

import java.time.Instant;
import java.util.UUID;

/** Một lần mua gói. orderCode null khi chưa lưu (database cấp). */
public record Order(
        Long orderCode,
        UUID ownerId,
        Plan plan,
        BillingPeriod period,
        long amountVnd,
        OrderStatus status,
        String checkoutUrl,
        Instant createdAt,
        Instant paidAt) {
}
