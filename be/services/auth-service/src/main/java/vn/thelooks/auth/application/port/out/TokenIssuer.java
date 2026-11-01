package vn.thelooks.auth.application.port.out;

import java.time.Instant;
import java.util.UUID;
import vn.thelooks.auth.domain.model.User;

/** Phát access JWT ký RS256; claim sub = userId, sid = refresh session, roles và permissions. */
public interface TokenIssuer {

    IssuedToken issue(User user, UUID sessionId);

    record IssuedToken(String token, Instant expiresAt) {
    }
}
