package vn.thelooks.billing.application.usecase;

import java.util.Map;
import java.util.UUID;
import vn.thelooks.billing.domain.model.Order;

public interface ConfirmPaymentUseCase {

    /** Trang thanh toán hỏi định kỳ: trạng thái đơn (gói được kích hoạt khi webhook báo tiền vào). */
    Order confirm(UUID ownerId, long orderCode);

    /** Webhook từ cổng thanh toán. @return false nếu không xác thực được người gửi */
    boolean handleWebhook(Map<String, Object> body, String authorization);
}
