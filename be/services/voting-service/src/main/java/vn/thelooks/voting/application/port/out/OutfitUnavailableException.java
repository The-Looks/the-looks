package vn.thelooks.voting.application.port.out;

public class OutfitUnavailableException extends RuntimeException {

    public OutfitUnavailableException(Throwable cause) {
        super("Không thể lấy thông tin outfit lúc này", cause);
    }
}
