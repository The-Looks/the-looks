package vn.thelooks.identity.infrastructure.persistence;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.support.TransactionTemplate;
import vn.thelooks.identity.application.port.out.RefreshSessionStore;

@Repository
class JdbcRefreshSessionStore implements RefreshSessionStore {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final JdbcTemplate jdbc;
    private final TransactionTemplate transactions;

    JdbcRefreshSessionStore(JdbcTemplate jdbc, TransactionTemplate transactions) {
        this.jdbc = jdbc;
        this.transactions = transactions;
    }

    @Override
    public Session create(UUID userId, Instant now, Instant expiresAt) {
        return transactions.execute(status -> {
            var id = UUID.randomUUID();
            var token = randomToken();
            jdbc.update("INSERT INTO refresh_sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
                    id, userId, java.sql.Timestamp.from(expiresAt));
            jdbc.update("INSERT INTO refresh_tokens (id, session_id, token_hash, expires_at) VALUES (?, ?, ?, ?)",
                    UUID.randomUUID(), id, hash(token), java.sql.Timestamp.from(expiresAt));
            return new Session(id, token, expiresAt);
        });
    }

    @Override
    public Rotation rotate(String rawToken, Instant now) {
        if (rawToken == null || rawToken.isBlank()) return Rotation.invalid();
        return transactions.execute(status -> {
            var rows = jdbc.query("""
                    SELECT t.id AS token_id, t.used_at, t.expires_at AS token_expires_at,
                           s.id AS session_id, s.user_id, s.revoked_at, s.expires_at AS session_expires_at
                    FROM refresh_tokens t JOIN refresh_sessions s ON s.id = t.session_id
                    WHERE t.token_hash = ? FOR UPDATE OF t, s
                    """, (rs, rowNum) -> new TokenRow(
                    rs.getObject("token_id", UUID.class),
                    rs.getTimestamp("used_at") == null ? null : rs.getTimestamp("used_at").toInstant(),
                    rs.getTimestamp("token_expires_at").toInstant(),
                    rs.getObject("session_id", UUID.class),
                    rs.getObject("user_id", UUID.class),
                    rs.getTimestamp("revoked_at") == null ? null : rs.getTimestamp("revoked_at").toInstant(),
                    rs.getTimestamp("session_expires_at").toInstant()), hash(rawToken));
            if (rows.isEmpty()) return Rotation.invalid();
            var row = rows.getFirst();
            if (row.usedAt() != null) {
                jdbc.update("UPDATE refresh_sessions SET revoked_at = COALESCE(revoked_at, ?), updated_at = ? WHERE id = ?",
                        java.sql.Timestamp.from(now), java.sql.Timestamp.from(now), row.sessionId());
                return Rotation.reused();
            }
            if (row.revokedAt() != null || !now.isBefore(row.sessionExpiresAt()) || !now.isBefore(row.tokenExpiresAt())) {
                return Rotation.invalid();
            }
            var next = randomToken();
            jdbc.update("UPDATE refresh_tokens SET used_at = ?, updated_at = ? WHERE id = ?",
                    java.sql.Timestamp.from(now), java.sql.Timestamp.from(now), row.tokenId());
            jdbc.update("INSERT INTO refresh_tokens (id, session_id, token_hash, expires_at) VALUES (?, ?, ?, ?)",
                    UUID.randomUUID(), row.sessionId(), hash(next), java.sql.Timestamp.from(row.sessionExpiresAt()));
            return new Rotation(Rotation.Status.OK, row.userId(), row.sessionId(), next, row.sessionExpiresAt());
        });
    }

    @Override
    public void revoke(String rawToken, Instant now) {
        if (rawToken == null || rawToken.isBlank()) return;
        transactions.executeWithoutResult(status -> {
            jdbc.update("""
                    UPDATE refresh_sessions SET revoked_at = COALESCE(revoked_at, ?), updated_at = ?
                    WHERE id IN (SELECT session_id FROM refresh_tokens WHERE token_hash = ?)
                    """, java.sql.Timestamp.from(now), java.sql.Timestamp.from(now), hash(rawToken));
        });
    }

    private static String randomToken() {
        var bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hash(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.GeneralSecurityException e) {
            throw new IllegalStateException(e);
        }
    }

    private record TokenRow(UUID tokenId, Instant usedAt, Instant tokenExpiresAt,
            UUID sessionId, UUID userId, Instant revokedAt, Instant sessionExpiresAt) {
    }
}
