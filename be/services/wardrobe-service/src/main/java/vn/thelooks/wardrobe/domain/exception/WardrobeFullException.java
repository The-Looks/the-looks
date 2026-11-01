package vn.thelooks.wardrobe.domain.exception;

/** Tủ đồ đã đủ số món của gói hiện tại. API trả 403 kèm gợi ý nâng cấp. */
public class WardrobeFullException extends RuntimeException {

    public WardrobeFullException(String message) {
        super(message);
    }
}
