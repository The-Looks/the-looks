package vn.thelooks.outfit.application.port.out;

public class PlanCheckUnavailableException extends RuntimeException {
    public PlanCheckUnavailableException(Throwable cause) {
        super("Chưa kiểm tra được gói của bạn, vui lòng thử lại sau.", cause);
    }
}
