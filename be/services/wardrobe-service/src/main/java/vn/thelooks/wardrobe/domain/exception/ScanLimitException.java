package vn.thelooks.wardrobe.domain.exception;

/** Đã gửi quá số ảnh cho AI nhận diện trong ngày. */
public class ScanLimitException extends RuntimeException {

    public ScanLimitException(String message) {
        super(message);
    }
}
