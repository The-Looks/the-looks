package vn.thelooks.billing.application.usecase;

import java.time.Instant;
import java.util.UUID;
import vn.thelooks.billing.domain.model.Order;

/**
 * Admin hoàn tiền một đơn đã thanh toán (tiền chuyển trả bằng tay ngoài hệ thống, theo trang /refund).
 * Đơn PAID → REFUNDED và gói bị trừ lại thời gian của đơn đó.
 *
 * @throws vn.thelooks.billing.domain.exception.OrderNotFoundException  không có đơn
 * @throws vn.thelooks.billing.domain.exception.OrderNotRefundableException đơn không ở trạng thái PAID
 */
public interface RefundOrderUseCase {

    /**
     * @param newExpiry hạn gói sau khi trừ; null khi người dùng đã đổi sang gói khác sau đơn này (admin chỉnh tay)
     */
    record RefundResult(Order order, Instant newExpiry) {}

    RefundResult refund(long orderCode, String reason, UUID adminId);
}
