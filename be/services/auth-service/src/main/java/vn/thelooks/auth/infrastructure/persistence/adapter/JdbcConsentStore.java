package vn.thelooks.auth.infrastructure.persistence.adapter;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import vn.thelooks.auth.application.port.out.ConsentStore;

@Repository
class JdbcConsentStore implements ConsentStore {

    private final JdbcTemplate jdbc;

    JdbcConsentStore(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void record(UUID userId, String version, Instant acceptedAt) {
        jdbc.update("INSERT INTO user_consents (user_id, version, accepted_at) VALUES (?, ?, ?) ON CONFLICT DO NOTHING",
                userId, version, Timestamp.from(acceptedAt));
    }
}
