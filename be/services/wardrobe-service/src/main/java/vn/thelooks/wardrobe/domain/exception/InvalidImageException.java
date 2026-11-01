package vn.thelooks.wardrobe.domain.exception;

/** Không có ảnh, quá 10 ảnh, ảnh quá 10 MB hoặc không phải JPEG/PNG/WebP. API trả 400. */
public class InvalidImageException extends RuntimeException {

    public InvalidImageException(String message) {
        super(message);
    }
}
