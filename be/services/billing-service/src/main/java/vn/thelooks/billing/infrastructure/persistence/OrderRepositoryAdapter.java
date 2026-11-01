package vn.thelooks.billing.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
import vn.thelooks.billing.application.port.out.OrderRepository;
import vn.thelooks.billing.domain.model.BillingPeriod;
import vn.thelooks.billing.domain.model.Order;
import vn.thelooks.billing.domain.model.OrderStatus;
import vn.thelooks.billing.domain.model.Plan;

@Component
class OrderRepositoryAdapter implements OrderRepository {

    private final JdbcClient jdbc;

    OrderRepositoryAdapter(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public Order create(Order o) {
        long code = jdbc.sql("""
                insert into billing_order (owner_id, plan, period, amount_vnd, status, created_at)
                values (:owner, :plan, :period, :amount, :status, :at)
                returning order_code
                """)
                .param("owner", o.ownerId())
                .param("plan", o.plan().name())
                .param("period", o.period().name())
                .param("amount", o.amountVnd())
                .param("status", o.status().name())
                .param("at", Timestamp.from(o.createdAt()))
                .query(Long.class)
                .single();
        return new Order(code, o.ownerId(), o.plan(), o.period(), o.amountVnd(), o.status(), null, o.createdAt(), null);
    }

    @Override
    public void setCheckoutUrl(long orderCode, String checkoutUrl) {
        jdbc.sql("update billing_order set checkout_url = :url where order_code = :code")
                .param("url", checkoutUrl)
                .param("code", orderCode)
                .update();
    }

    @Override
    public Optional<Order> find(long orderCode) {
        return jdbc.sql("select * from billing_order where order_code = :code")
                .param("code", orderCode)
                .query(OrderRepositoryAdapter::map)
                .optional();
    }

    @Override
    public boolean markPaid(long orderCode, Instant paidAt) {
        return jdbc.sql("update billing_order set status = 'PAID', paid_at = :at where order_code = :code and status = 'PENDING'")
                .param("at", Timestamp.from(paidAt))
                .param("code", orderCode)
                .update() == 1;
    }

    private static Order map(ResultSet rs, int row) throws SQLException {
        Timestamp paid = rs.getTimestamp("paid_at");
        return new Order(
                rs.getLong("order_code"),
                rs.getObject("owner_id", UUID.class),
                Plan.valueOf(rs.getString("plan")),
                BillingPeriod.valueOf(rs.getString("period")),
                rs.getLong("amount_vnd"),
                OrderStatus.valueOf(rs.getString("status")),
                rs.getString("checkout_url"),
                rs.getTimestamp("created_at").toInstant(),
                paid == null ? null : paid.toInstant());
    }
}
