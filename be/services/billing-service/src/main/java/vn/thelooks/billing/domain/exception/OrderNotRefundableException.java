package vn.thelooks.billing.domain.exception;

/** Chỉ đơn đã thanh toán (PAID) mới hoàn tiền được, và chỉ một lần. */
public class OrderNotRefundableException extends RuntimeException {

    public OrderNotRefundableException(String message) {
        super(message);
    }
}
