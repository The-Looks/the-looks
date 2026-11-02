package vn.thelooks.billing.application.port.out;

import java.util.Map;
import java.util.Optional;
import vn.thelooks.billing.domain.model.Order;

/** Cổng thanh toán (SePay, hoặc bản giả khi dev). */
public interface PaymentGateway {

    /** URL ảnh VietQR cho đơn đã lưu (đã có orderCode). Web-app hiện ảnh này để người dùng quét. */
    String createCheckoutUrl(Order order);

    /** Hỏi trực tiếp cổng thanh toán xem đơn đã trả chưa. SePay chỉ báo qua webhook nên luôn false. */
    boolean isPaid(long orderCode, long amountVnd);

    /** Webhook có đúng do cổng thanh toán gửi không (header Authorization). */
    boolean isAuthentic(String authorization);

    /** Tiền vào cho một đơn; rỗng nếu không phải tiền vào hoặc nội dung không có mã đơn. */
    Optional<PaidNotice> parseWebhook(Map<String, Object> body);

    record PaidNotice(long orderCode, long amountVnd) {
    }
}
