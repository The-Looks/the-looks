package vn.thelooks.billing.application.port.out;

import java.time.Instant;
import java.util.Optional;
import vn.thelooks.billing.domain.model.Order;

public interface OrderRepository {

    /** Lưu đơn mới, trả về đơn kèm orderCode do database cấp. */
    Order create(Order order);

    void setCheckoutUrl(long orderCode, String checkoutUrl);

    Optional<Order> find(long orderCode);

    /** PENDING → PAID, chỉ một lần. @return false nếu đơn không còn PENDING (đã xử lý rồi) */
    boolean markPaid(long orderCode, Instant paidAt);
}
