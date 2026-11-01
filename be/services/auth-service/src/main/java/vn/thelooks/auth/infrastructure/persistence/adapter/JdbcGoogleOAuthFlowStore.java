package vn.thelooks.auth.infrastructure.persistence.adapter;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;
import vn.thelooks.auth.application.port.out.GoogleOAuthFlowStore;

/** Lưu state, nonce và PKCE verifier; callback tiêu thụ state đúng một lần. */
@Repository
class JdbcGoogleOAuthFlowStore implements GoogleOAuthFlowStore {

    private final JdbcTemplate jdbc;
    private final TransactionTemplate consumeTransaction;

    JdbcGoogleOAuthFlowStore(JdbcTemplate jdbc, PlatformTransactionManager transactions) {
        this.jdbc = jdbc;
        consumeTransaction = new TransactionTemplate(transactions);
        consumeTransaction.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    @Override
    public void save(String stateHash, String nonce, String codeVerifier, Instant expiresAt) {
        jdbc.update("INSERT INTO google_oauth_flows (state_hash, nonce, code_verifier, expires_at) VALUES (?, ?, ?, ?)",
                stateHash, nonce, codeVerifier, Timestamp.from(expiresAt));
    }

    @Override
    public Optional<Flow> consume(String stateHash) {
        return consumeTransaction.execute(status -> jdbc.query(
                "DELETE FROM google_oauth_flows WHERE state_hash = ? RETURNING nonce, code_verifier, expires_at",
                (rs, row) -> new Flow(rs.getString("nonce"), rs.getString("code_verifier"),
                        rs.getTimestamp("expires_at").toInstant()), stateHash).stream().findFirst());
    }
}
