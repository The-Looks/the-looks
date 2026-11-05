package vn.thelooks.billing.infrastructure.persistence;

import java.time.LocalDate;
import java.util.List;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
import vn.thelooks.billing.application.port.out.BillingStatsQuery;

@Component
class BillingStatsAdapter implements BillingStatsQuery {

    private final JdbcClient jdbc;

    BillingStatsAdapter(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public BillingStats stats(int days) {
        long plus = activeSubscribers("PLUS");
        long pro = activeSubscribers("PRO");
        List<DailyRevenue> daily = jdbc.sql("""
                with days as (
                    select generate_series((now() at time zone 'Asia/Ho_Chi_Minh')::date - (:days - 1),
                                           (now() at time zone 'Asia/Ho_Chi_Minh')::date, interval '1 day')::date as day
                )
                select d.day, count(o.order_code) as orders, coalesce(sum(o.amount_vnd), 0) as revenue
                from days d
                left join billing_order o on o.status = 'PAID' and (o.paid_at at time zone 'Asia/Ho_Chi_Minh')::date = d.day
                group by d.day order by d.day
                """)
                .param("days", days)
                .query((rs, n) -> new DailyRevenue(rs.getObject("day", LocalDate.class), rs.getLong("orders"), rs.getLong("revenue")))
                .list();
        long orders = daily.stream().mapToLong(DailyRevenue::paidOrders).sum();
        long revenue = daily.stream().mapToLong(DailyRevenue::revenueVnd).sum();
        return new BillingStats(plus, pro, orders, revenue, daily);
    }

    private long activeSubscribers(String plan) {
        return jdbc.sql("select count(*) from billing_subscription where plan = :plan and expires_at > now()")
                .param("plan", plan).query(Long.class).single();
    }
}
