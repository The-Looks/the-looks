package vn.thelooks.wardrobe.domain.exception;

/** Món đồ không tồn tại hoặc không thuộc người dùng. API trả 404. */
public class ClothingItemNotFoundException extends RuntimeException {

    public ClothingItemNotFoundException(String message) {
        super(message);
    }
}
