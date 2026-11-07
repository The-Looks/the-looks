package vn.thelooks.wardrobe.application.port.out;

public class StatsAccessUnavailableException extends RuntimeException {
    public StatsAccessUnavailableException(Throwable cause) { super("Chưa kiểm tra được quyền tính năng Pro. Hãy thử lại sau.", cause); }
}
