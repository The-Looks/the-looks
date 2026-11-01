package vn.thelooks.billing.domain.exception;

/** Gói hoặc kỳ thanh toán không hợp lệ. API trả 400. */
public class InvalidPlanException extends RuntimeException {

    public InvalidPlanException(String message) {
        super(message);
    }
}
