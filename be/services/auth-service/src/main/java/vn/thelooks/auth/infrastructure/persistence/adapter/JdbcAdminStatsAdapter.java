package vn.thelooks.auth.infrastructure.persistence.adapter;

import java.time.LocalDate;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import vn.thelooks.auth.application.port.out.AdminStatsQueryPort;

/**
 * Đếm trực tiếp bằng SQL. "Hoạt động" = có refresh token mới trong ngày: web làm mới phiên mỗi lần mở app,
 * nên không cần thêm bảng ghi lượt truy cập.
 */
@Component
class JdbcAdminStatsAdapter implements AdminStatsQueryPort {

    /** Chuỗi ngày theo giờ Việt Nam, kể cả ngày không có dữ liệu. Tham số: số ngày. */
    private static final String DAYS = """
            with days as (
                select generate_series((now() at time zone 'Asia/Ho_Chi_Minh')::date - (? - 1),
                                       (now() at time zone 'Asia/Ho_Chi_Minh')::date, interval '1 day')::date as day
            )
            """;

    private final JdbcTemplate jdbc;

    JdbcAdminStatsAdapter(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Override
    public UserStats userStats(int days) {
        long total = jdbc.queryForObject("select count(*) from users", Long.class);
        long new7 = jdbc.queryForObject("select count(*) from users where created_at > now() - interval '7 days'", Long.class);
        long active7 = jdbc.queryForObject("""
                select count(distinct s.user_id) from refresh_tokens t join refresh_sessions s on s.id = t.session_id
                where t.created_at > now() - interval '7 days'
                """, Long.class);
        List<DailyCount> newUsers = daily(DAYS + """
                select d.day, count(u.id) from days d
                left join users u on (u.created_at at time zone 'Asia/Ho_Chi_Minh')::date = d.day
                group by d.day order by d.day
                """, days);
        List<DailyCount> active = daily(DAYS + """
                select d.day, count(distinct s.user_id) from days d
                left join refresh_tokens t on (t.created_at at time zone 'Asia/Ho_Chi_Minh')::date = d.day
                left join refresh_sessions s on s.id = t.session_id
                group by d.day order by d.day
                """, days);
        return new UserStats(total, new7, active7, newUsers, active);
    }

    private List<DailyCount> daily(String sql, int days) {
        return jdbc.query(sql, (rs, n) -> new DailyCount(rs.getObject(1, LocalDate.class), rs.getLong(2)), days);
    }
}
