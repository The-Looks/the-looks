package vn.thelooks.auth.infrastructure.persistence.adapter;

import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import vn.thelooks.auth.application.port.out.AdminAuditRepositoryPort;

@Repository
class AdminAuditRepositoryAdapter implements AdminAuditRepositoryPort {
    private final JdbcTemplate jdbc;
    AdminAuditRepositoryAdapter(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordFailure(UUID actor, String target, String action, String detail) {
        jdbc.update("""
                INSERT INTO admin_audit(id,actor_id,target_id,action,detail,outcome)
                VALUES (?,?,?,?,?,'FAILED')
                """, UUID.randomUUID(), actor, target, action, detail);
    }
}
