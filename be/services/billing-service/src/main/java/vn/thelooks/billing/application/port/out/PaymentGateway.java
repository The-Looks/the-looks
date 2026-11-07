package vn.thelooks.billing.application.port.out;

import java.util.Map;
import java.util.Optional;
import vn.thelooks.billing.domain.model.Order;

/** Cổng thanh toán (PayOS, hoặc bản giả khi dev). */
public interface PaymentGateway {

    /** Tạo link thanh toán cho đơn đã lưu (đã có orderCode). */
    String createCheckoutUrl(Order order);

    /** Hỏi trực tiếp cổng thanh toán xem đơn đã trả đủ tiền chưa. Dùng khi người dùng quay lại trang web. */
    boolean isPaid(long orderCode, long amountVnd);

    /** Chỉ trả true khi cổng xác nhận link đã hủy và chưa nhận tiền. Lỗi mạng phải ném exception. */
    boolean cancelUnpaid(long orderCode);

    /**
     * Webhook từ cổng thanh toán: kiểm tra chữ ký.
     * @return mã đơn đã thanh toán thành công; rỗng nếu chữ ký sai hoặc không phải thông báo thanh toán thành công
     */
    Optional<PaidNotice> verifyWebhook(Map<String, Object> body);

    record PaidNotice(long orderCode, long amountVnd) {
    }
}
