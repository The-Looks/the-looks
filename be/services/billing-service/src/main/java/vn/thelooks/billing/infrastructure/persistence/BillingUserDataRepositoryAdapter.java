package vn.thelooks.billing.infrastructure.persistence;

import java.util.UUID;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import vn.thelooks.billing.application.port.out.BillingUserDataRepositoryPort;
import vn.thelooks.billing.domain.model.AdminBillingSummary;

@Repository
class BillingUserDataRepositoryAdapter implements BillingUserDataRepositoryPort {
    private final JdbcTemplate jdbc;
    BillingUserDataRepositoryAdapter(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public AdminBillingSummary summary(UUID userId) {
        return jdbc.query("SELECT plan,expires_at FROM billing_subscription WHERE owner_id=? AND expires_at>now()",
                (rs, row) -> new AdminBillingSummary(rs.getString(1), rs.getTimestamp(2).toInstant().toString()), userId)
                .stream().findFirst().orElse(new AdminBillingSummary("FREE", null));
    }

    public List<Long> pendingOrderCodes(UUID userId) {
        return jdbc.query("SELECT order_code FROM billing_order WHERE owner_id=? AND status='PENDING' ORDER BY order_code",
                (rs, row) -> rs.getLong(1), userId);
    }

    public boolean markCancelled(UUID userId, long orderCode) {
        return jdbc.update("UPDATE billing_order SET status='CANCELLED' WHERE owner_id=? AND order_code=? AND status='PENDING'",
                userId, orderCode) == 1;
    }

    @Transactional
    public void delete(UUID userId) {
        jdbc.queryForObject("SELECT count(*) FROM (SELECT pg_advisory_xact_lock(hashtextextended(?,0))) l", Long.class, userId.toString());
        Long pending = jdbc.queryForObject("SELECT count(*) FROM billing_order WHERE owner_id=? AND status='PENDING'", Long.class, userId);
        if (pending != null && pending > 0)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Còn đơn thanh toán chưa được đối soát");
        jdbc.update("INSERT INTO billing_deleted_owner(owner_id) VALUES (?) ON CONFLICT DO NOTHING", userId);
        jdbc.update("DELETE FROM billing_subscription WHERE owner_id=?", userId);
        jdbc.update("UPDATE billing_order SET owner_id=NULL WHERE owner_id=?", userId);
    }
}
