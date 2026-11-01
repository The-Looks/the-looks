package vn.thelooks.billing.application.usecase;

import java.util.Map;
import java.util.UUID;
import vn.thelooks.billing.domain.model.Order;

public interface ConfirmPaymentUseCase {

    /** Người dùng quay lại từ trang thanh toán: hỏi cổng thanh toán, nếu đã trả thì kích hoạt gói. */
    Order confirm(UUID ownerId, long orderCode);

    /** Webhook từ cổng thanh toán. @return false nếu chữ ký sai */
    boolean handleWebhook(Map<String, Object> body);
}
