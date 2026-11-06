package vn.thelooks.billing.application.port.out;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import vn.thelooks.billing.domain.model.BillingPeriod;
import vn.thelooks.billing.domain.model.OrderStatus;
import vn.thelooks.billing.domain.model.Plan;

/** Danh sách đơn cho trang Admin. Mọi bộ lọc đều không bắt buộc (null = không lọc). */
public interface AdminOrderQuery {

    record AdminOrder(long orderCode, UUID ownerId, Plan plan, BillingPeriod period, long amountVnd, OrderStatus status,
            Instant createdAt, Instant paidAt, Instant refundedAt, String refundReason) {}

    record OrderPage(List<AdminOrder> items, long total, int page, int size) {}

    /** Mới nhất trước. */
    OrderPage list(OrderStatus status, UUID ownerId, Long orderCode, int page, int size);
}
