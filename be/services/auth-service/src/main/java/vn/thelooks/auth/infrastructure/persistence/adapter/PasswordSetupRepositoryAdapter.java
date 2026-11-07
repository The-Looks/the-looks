package vn.thelooks.auth.infrastructure.persistence.adapter;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import vn.thelooks.auth.application.port.out.PasswordSetupRepositoryPort;

@Repository
class PasswordSetupRepositoryAdapter implements PasswordSetupRepositoryPort {
    private final JdbcTemplate jdbc;
    PasswordSetupRepositoryAdapter(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Override
    public boolean hasPassword(UUID userId) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
                "SELECT password_hash IS NOT NULL FROM users WHERE id=?", Boolean.class, userId));
    }

    @Override
    public boolean isRecentGoogleSession(UUID userId, UUID sessionId, Instant since) {
        return Boolean.TRUE.equals(jdbc.queryForObject("""
                SELECT EXISTS (SELECT 1 FROM refresh_sessions s JOIN user_identities i ON i.user_id=s.user_id
                WHERE s.id=? AND s.user_id=? AND s.created_at>=? AND s.revoked_at IS NULL
                AND i.provider='GOOGLE')
                """, Boolean.class, sessionId, userId, Timestamp.from(since)));
    }

    @Override
    public boolean setIfAbsent(UUID userId, String hash) {
        return jdbc.update("UPDATE users SET password_hash=?,updated_at=now() WHERE id=? AND password_hash IS NULL",
                hash, userId) == 1;
    }
}
