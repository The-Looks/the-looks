package vn.thelooks.billing.application.port.out;

import java.time.LocalDate;
import java.util.List;

/** Thống kê gói và doanh thu cho trang Admin. Ngày tính theo giờ Việt Nam. */
public interface BillingStatsQuery {

    record DailyRevenue(LocalDate date, long paidOrders, long revenueVnd) {}

    /**
     * @param plusSubscribers / proSubscribers người đang dùng gói còn hạn
     * @param revenueVnd tổng tiền các đơn đã thanh toán trong {@code days} ngày
     */
    record BillingStats(long plusSubscribers, long proSubscribers, long paidOrders, long revenueVnd,
            List<DailyRevenue> daily) {}

    BillingStats stats(int days);
}
