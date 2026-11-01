package vn.thelooks.security;

import java.util.UUID;
import org.springframework.security.oauth2.jwt.Jwt;

/** JWT do auth-service phát có claim sub = userId. */
public final class CurrentUser {

    private CurrentUser() {
    }

    public static UUID id(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
