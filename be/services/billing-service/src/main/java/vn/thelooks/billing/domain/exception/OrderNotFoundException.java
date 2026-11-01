package vn.thelooks.billing.domain.exception;

/** Không có đơn với mã này, hoặc đơn không thuộc người dùng. API trả 404. */
public class OrderNotFoundException extends RuntimeException {

    public OrderNotFoundException(String message) {
        super(message);
    }
}
