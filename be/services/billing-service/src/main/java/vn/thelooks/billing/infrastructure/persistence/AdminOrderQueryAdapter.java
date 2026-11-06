package vn.thelooks.billing.infrastructure.persistence;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
import vn.thelooks.billing.application.port.out.AdminOrderQuery;
import vn.thelooks.billing.domain.model.BillingPeriod;
import vn.thelooks.billing.domain.model.OrderStatus;
import vn.thelooks.billing.domain.model.Plan;

@Component
class AdminOrderQueryAdapter implements AdminOrderQuery {

    /** Bộ lọc null thì bỏ qua: dùng "(:x is null or cột = :x)" để giữ một câu SQL cố định. */
    private static final String WHERE = """
            where (cast(:status as varchar) is null or status = :status)
              and (cast(:owner as uuid) is null or owner_id = :owner)
              and (cast(:code as bigint) is null or order_code = :code)
            """;

    private final JdbcClient jdbc;

    AdminOrderQueryAdapter(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public OrderPage list(OrderStatus status, UUID ownerId, Long orderCode, int page, int size) {
        String statusName = status == null ? null : status.name();
        long total = jdbc.sql("select count(*) from billing_order " + WHERE)
                .param("status", statusName).param("owner", ownerId).param("code", orderCode)
                .query(Long.class).single();
        var items = jdbc.sql("select * from billing_order " + WHERE + " order by created_at desc limit :size offset :offset")
                .param("status", statusName).param("owner", ownerId).param("code", orderCode)
                .param("size", size).param("offset", (long) page * size)
                .query((rs, n) -> new AdminOrder(
                        rs.getLong("order_code"),
                        rs.getObject("owner_id", UUID.class),
                        Plan.valueOf(rs.getString("plan")),
                        BillingPeriod.valueOf(rs.getString("period")),
                        rs.getLong("amount_vnd"),
                        OrderStatus.valueOf(rs.getString("status")),
                        rs.getTimestamp("created_at").toInstant(),
                        instant(rs.getTimestamp("paid_at")),
                        instant(rs.getTimestamp("refunded_at")),
                        rs.getString("refund_reason")))
                .list();
        return new OrderPage(items, total, page, size);
    }

    private static Instant instant(Timestamp t) {
        return t == null ? null : t.toInstant();
    }
}
