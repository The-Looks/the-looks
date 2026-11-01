package vn.thelooks.identity.infrastructure.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import vn.thelooks.identity.application.port.out.GoogleIdentityStore;

@Repository
class JdbcGoogleIdentityStore implements GoogleIdentityStore {

    private final JdbcTemplate jdbc;

    JdbcGoogleIdentityStore(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public Optional<UUID> findUserId(String subject) {
        return jdbc.query("SELECT user_id FROM user_identities WHERE provider = 'GOOGLE' AND provider_subject = ?",
                (rs, row) -> rs.getObject(1, UUID.class), subject).stream().findFirst();
    }

    @Override
    public void link(String subject, UUID userId) {
        jdbc.update("INSERT INTO user_identities (provider, provider_subject, user_id) VALUES ('GOOGLE', ?, ?)",
                subject, userId);
    }
}
