package vn.thelooks.billing.application.port.out;

/** Không gọi được cổng thanh toán. API trả 503. */
public class PaymentGatewayException extends RuntimeException {

    public PaymentGatewayException(String message, Throwable cause) {
        super(message, cause);
    }
}
