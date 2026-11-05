package vn.thelooks.outfit.application.port.out;

import java.time.LocalDate;
import java.util.List;

/** Thống kê lượt bấm "Gợi ý mua thêm" cho trang Admin. Ngày tính theo giờ Việt Nam. */
public interface AffiliateStatsQuery {

    record DailyClicks(LocalDate date, long clicks, long users) {}

    record TopProduct(String source, String productId, String title, long clicks) {}

    /**
     * @param users số người khác nhau đã bấm trong {@code days} ngày
     * @param top   5 sản phẩm được bấm nhiều nhất
     */
    record AffiliateStats(long clicks, long users, List<DailyClicks> daily, List<TopProduct> top) {}

    AffiliateStats stats(int days);
}
