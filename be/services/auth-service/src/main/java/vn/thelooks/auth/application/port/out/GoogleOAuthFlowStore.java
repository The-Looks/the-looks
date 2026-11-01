package vn.thelooks.auth.application.port.out;

import java.time.Instant;
import java.util.Optional;

public interface GoogleOAuthFlowStore {

    void save(String stateHash, String nonce, String codeVerifier, Instant expiresAt);

    Optional<Flow> consume(String stateHash);

    record Flow(String nonce, String codeVerifier, Instant expiresAt) {
    }
}
