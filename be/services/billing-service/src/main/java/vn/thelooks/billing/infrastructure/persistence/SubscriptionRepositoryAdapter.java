package vn.thelooks.billing.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
import vn.thelooks.billing.application.port.out.SubscriptionRepository;
import vn.thelooks.billing.domain.model.BillingPeriod;
import vn.thelooks.billing.domain.model.Plan;
import vn.thelooks.billing.domain.model.Subscription;

@Component
class SubscriptionRepositoryAdapter implements SubscriptionRepository {

    private final JdbcClient jdbc;

    SubscriptionRepositoryAdapter(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public Optional<Subscription> findForUpdate(UUID ownerId) {
        return query("select * from billing_subscription where owner_id = :owner for update", ownerId);
    }

    @Override
    public Optional<Subscription> find(UUID ownerId) {
        return query("select * from billing_subscription where owner_id = :owner", ownerId);
    }

    @Override
    public void save(Subscription s) {
        jdbc.sql("""
                insert into billing_subscription (owner_id, plan, period, expires_at, auto_renew, updated_at)
                values (:owner, :plan, :period, :expires, :autoRenew, now())
                on conflict (owner_id) do update set plan = excluded.plan, period = excluded.period,
                    expires_at = excluded.expires_at, auto_renew = excluded.auto_renew, updated_at = now()
                """)
                .param("owner", s.ownerId())
                .param("plan", s.plan().name())
                .param("period", s.period().name())
                .param("expires", Timestamp.from(s.expiresAt()))
                .param("autoRenew", s.autoRenew())
                .update();
    }

    private Optional<Subscription> query(String sql, UUID ownerId) {
        return jdbc.sql(sql).param("owner", ownerId).query(SubscriptionRepositoryAdapter::map).optional();
    }

    private static Subscription map(ResultSet rs, int row) throws SQLException {
        Instant expires = rs.getTimestamp("expires_at").toInstant();
        return new Subscription(rs.getObject("owner_id", UUID.class), Plan.valueOf(rs.getString("plan")),
                BillingPeriod.valueOf(rs.getString("period")), expires, rs.getBoolean("auto_renew"));
    }
}
