package vn.thelooks.outfit.infrastructure.persistence;

import java.time.LocalDate;
import java.util.List;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
import vn.thelooks.outfit.application.port.out.AffiliateStatsQuery;

@Component
class AffiliateStatsAdapter implements AffiliateStatsQuery {

    private static final String SINCE = "(now() at time zone 'Asia/Ho_Chi_Minh')::date - (:days - 1)";

    private final JdbcClient jdbc;

    AffiliateStatsAdapter(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public AffiliateStats stats(int days) {
        List<DailyClicks> daily = jdbc.sql("""
                with days as (
                    select generate_series(%s, (now() at time zone 'Asia/Ho_Chi_Minh')::date, interval '1 day')::date as day
                )
                select d.day, count(c.id) as clicks, count(distinct c.owner_id) as users
                from days d
                left join affiliate_click c on (c.created_at at time zone 'Asia/Ho_Chi_Minh')::date = d.day
                group by d.day order by d.day
                """.formatted(SINCE))
                .param("days", days)
                .query((rs, n) -> new DailyClicks(rs.getObject("day", LocalDate.class), rs.getLong("clicks"), rs.getLong("users")))
                .list();
        long users = jdbc.sql("""
                select count(distinct owner_id) from affiliate_click
                where (created_at at time zone 'Asia/Ho_Chi_Minh')::date >= %s
                """.formatted(SINCE))
                .param("days", days).query(Long.class).single();
        List<TopProduct> top = jdbc.sql("""
                select source, product_id, max(title) as title, count(*) as clicks from affiliate_click
                where (created_at at time zone 'Asia/Ho_Chi_Minh')::date >= %s
                group by source, product_id order by clicks desc limit 5
                """.formatted(SINCE))
                .param("days", days)
                .query((rs, n) -> new TopProduct(rs.getString("source"), rs.getString("product_id"), rs.getString("title"),
                        rs.getLong("clicks")))
                .list();
        return new AffiliateStats(daily.stream().mapToLong(DailyClicks::clicks).sum(), users, daily, top);
    }
}
