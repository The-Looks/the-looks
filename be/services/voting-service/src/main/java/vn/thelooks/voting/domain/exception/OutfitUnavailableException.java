package vn.thelooks.voting.domain.exception;

public class OutfitUnavailableException extends RuntimeException {

    public OutfitUnavailableException(Throwable cause) {
        super("Không thể lấy thông tin outfit lúc này", cause);
    }
}
