package vn.thelooks.outfit.application.port.out;

/** Lịch mặc chỉ dành cho gói có tính năng WEAR_CALENDAR (Pro). */
public interface WearCalendarAccess {

    /**
     * @throws WearCalendarLockedException gói hiện tại không có lịch mặc
     * @throws PlanCheckUnavailableException không hỏi được billing-service
     */
    void requireWearCalendar();
}
