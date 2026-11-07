package vn.thelooks.outfit.application.port.out;

public class WearCalendarLockedException extends RuntimeException {
    public WearCalendarLockedException() {
        super("Lịch mặc dành cho gói Pro. Nâng cấp để lên lịch outfit theo ngày.");
    }
}
