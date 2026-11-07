package vn.thelooks.billing.infrastructure.persistence;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
import vn.thelooks.billing.application.port.out.RenewalReminderRepository;
import vn.thelooks.billing.domain.model.BillingPeriod;
import vn.thelooks.billing.domain.model.Plan;
import vn.thelooks.billing.domain.model.Subscription;

@Component
class RenewalReminderRepositoryAdapter implements RenewalReminderRepository {

    private final JdbcClient jdbc;

    RenewalReminderRepositoryAdapter(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void saveContact(UUID ownerId, String email) {
        jdbc.sql("""
                insert into billing_contact (owner_id, email, updated_at) values (:owner, :email, now())
                on conflict (owner_id) do update set email = excluded.email, updated_at = now()
                """).param("owner", ownerId).param("email", email).update();
    }

    @Override
    public List<Due> due(Instant now) {
        return jdbc.sql("""
                select s.owner_id, c.email, s.plan, s.period, s.expires_at
                from billing_subscription s join billing_contact c on c.owner_id = s.owner_id
                where s.auto_renew
                  and s.expires_at > :now and s.expires_at <= :until
                  and s.reminded_for_expiry is distinct from s.expires_at
                order by s.expires_at
                limit 200
                """)
                .param("now", Timestamp.from(now))
                .param("until", Timestamp.from(now.plus(Subscription.REMIND_BEFORE)))
                .query((rs, n) -> new Due(rs.getObject("owner_id", UUID.class), rs.getString("email"),
                        Plan.valueOf(rs.getString("plan")), BillingPeriod.valueOf(rs.getString("period")),
                        rs.getTimestamp("expires_at").toInstant()))
                .list();
    }

    @Override
    public void markReminded(UUID ownerId, Instant expiresAt) {
        jdbc.sql("update billing_subscription set reminded_for_expiry = :expiry where owner_id = :owner")
                .param("owner", ownerId).param("expiry", Timestamp.from(expiresAt)).update();
    }
}
