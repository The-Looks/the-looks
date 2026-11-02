package vn.thelooks.auth.infrastructure.persistence.adapter;

import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.support.TransactionTemplate;
import vn.thelooks.auth.application.port.out.FirstAdminRoleAssigner;

/** Chỉ gán role ADMIN cho email đã xác minh đầu tiên, có khóa để tránh cấp trùng đồng thời. */
@Repository
class JdbcFirstAdminRoleAssigner implements FirstAdminRoleAssigner {

    private final JdbcTemplate jdbc;
    private final TransactionTemplate transactions;

    JdbcFirstAdminRoleAssigner(JdbcTemplate jdbc, TransactionTemplate transactions) {
        this.jdbc = jdbc;
        this.transactions = transactions;
    }

    @Override
    public boolean promoteFirstVerifiedAdmin(UUID userId, String email) {
        return Boolean.TRUE.equals(transactions.execute(status -> {
            jdbc.execute("SELECT pg_advisory_xact_lock(83104211)");
            return jdbc.update("""
                    INSERT INTO user_roles (user_id, role_id)
                    SELECT u.id, r.id FROM users u JOIN roles r ON r.code = 'ADMIN'
                    WHERE u.id = ? AND lower(u.email) = lower(?) AND u.email_verified = TRUE
                      AND NOT EXISTS (
                          SELECT 1 FROM user_roles ur JOIN roles existing ON existing.id = ur.role_id
                          WHERE existing.code = 'ADMIN'
                      )
                    ON CONFLICT DO NOTHING
                    """, userId, email) == 1;
        }));
    }
}
