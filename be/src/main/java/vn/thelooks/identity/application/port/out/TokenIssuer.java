package vn.thelooks.identity.application.port.out;

import java.time.Instant;
import vn.thelooks.identity.domain.User;

/** Phát JWT ký bằng thelooks.security.jwt-secret (claim sub = userId, roles = [role]). */
public interface TokenIssuer {

    IssuedToken issue(User user);

    record IssuedToken(String token, Instant expiresAt) {
    }
}
