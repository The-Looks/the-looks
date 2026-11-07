package vn.thelooks.wardrobe.application.port.out;

public class WearHistoryUnavailableException extends RuntimeException {
    public WearHistoryUnavailableException(Throwable cause) {
        super("Chưa tải được lịch sử mặc. Hãy thử lại hoặc sắp xếp theo mới nhất.", cause);
    }
}
