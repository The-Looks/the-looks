package vn.thelooks.auth.application.port.out;

import java.time.LocalDate;
import java.util.List;

/** Thống kê người dùng cho trang Admin. Ngày tính theo giờ Việt Nam. */
public interface AdminStatsQueryPort {
    record DailyCount(LocalDate date, long count) {}

    /**
     * @param activeUsers người dùng hoạt động mỗi ngày: có mở app (làm mới phiên đăng nhập) trong ngày đó
     * @param activeLast7Days số người khác nhau hoạt động trong 7 ngày qua
     */
    record UserStats(long totalUsers, long newLast7Days, long activeLast7Days,
            List<DailyCount> newUsers, List<DailyCount> activeUsers) {}

    /** @param days số ngày gần nhất (kể cả hôm nay), mỗi ngày một dòng, ngày không có ai thì 0 */
    UserStats userStats(int days);
}
