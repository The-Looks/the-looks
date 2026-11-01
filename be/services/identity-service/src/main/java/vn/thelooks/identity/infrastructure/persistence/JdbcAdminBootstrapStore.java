package vn.thelooks.identity.infrastructure.persistence;

import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.support.TransactionTemplate;
import vn.thelooks.identity.application.port.out.AdminBootstrapStore;

@Repository
class JdbcAdminBootstrapStore implements AdminBootstrapStore {

    private final JdbcTemplate jdbc;
    private final TransactionTemplate transactions;

    JdbcAdminBootstrapStore(JdbcTemplate jdbc, TransactionTemplate transactions) {
        this.jdbc = jdbc;
        this.transactions = transactions;
    }

    @Override
    public boolean promoteFirstVerifiedAdmin(UUID userId, String email) {
        return Boolean.TRUE.equals(transactions.execute(status -> {
            jdbc.execute("SELECT pg_advisory_xact_lock(83104211)");
            return jdbc.update("""
                    UPDATE users SET role = 'ADMIN', updated_at = now()
                    WHERE id = ? AND lower(email) = lower(?) AND email_verified = TRUE
                      AND NOT EXISTS (SELECT 1 FROM users WHERE role = 'ADMIN')
                    """, userId, email) == 1;
        }));
    }
}
