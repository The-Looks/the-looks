package vn.thelooks.outfit.domain.exception;

/** Outfit không tồn tại hoặc không thuộc người dùng. API trả 404. */
public class OutfitNotFoundException extends RuntimeException {

    public OutfitNotFoundException(String message) {
        super(message);
    }
}
