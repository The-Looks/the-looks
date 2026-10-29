package vn.thelooks.outfit.application.port.out;

/** wardrobe-service không phản hồi hoặc lỗi. API trả 503. */
public class WardrobeUnavailableException extends RuntimeException {

    public WardrobeUnavailableException(Throwable cause) {
        super("Tủ đồ tạm thời không khả dụng", cause);
    }
}
