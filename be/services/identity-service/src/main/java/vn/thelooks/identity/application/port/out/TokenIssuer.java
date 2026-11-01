package vn.thelooks.identity.application.port.out;

import java.time.Instant;
import vn.thelooks.identity.domain.model.User;

/** Phát JWT ký bằng private key RS256 (claim sub = userId, roles = [role]). */
public interface TokenIssuer {

    IssuedToken issue(User user);

    record IssuedToken(String token, Instant expiresAt) {
    }
}
