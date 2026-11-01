package vn.thelooks.billing.api.dto;

import java.time.Instant;
import vn.thelooks.billing.domain.model.BillingPeriod;
import vn.thelooks.billing.domain.model.Order;
import vn.thelooks.billing.domain.model.OrderStatus;
import vn.thelooks.billing.domain.model.Plan;

public record OrderResponse(long orderCode, Plan plan, BillingPeriod period, long amountVnd, OrderStatus status,
        String checkoutUrl, Instant createdAt, Instant paidAt) {

    public static OrderResponse from(Order o) {
        return new OrderResponse(o.orderCode(), o.plan(), o.period(), o.amountVnd(), o.status(), o.checkoutUrl(),
                o.createdAt(), o.paidAt());
    }
}
