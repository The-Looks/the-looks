package vn.thelooks.wardrobe.domain.exception;

/** Thao tác không hợp với trạng thái món đồ (ví dụ xác nhận món đã xác nhận). API trả 409. */
public class InvalidItemStateException extends RuntimeException {

    public InvalidItemStateException(String message) {
        super(message);
    }
}
