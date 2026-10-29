package vn.thelooks.outfit.domain.exception;

/** Dữ liệu outfit không hợp lệ (món không có trong tủ, trùng món...). API trả 400. */
public class InvalidOutfitException extends RuntimeException {

    public InvalidOutfitException(String message) {
        super(message);
    }
}
