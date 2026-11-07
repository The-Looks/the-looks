package vn.thelooks.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

class AccountDeletionAuthorizationTest {
    private final AccountDeletionAuthorization authorization = new AccountDeletionAuthorization();

    @Test
    void internalTokenCanDeleteOnlyItsSignedTarget() {
        UUID target = UUID.randomUUID();
        var token = Jwt.withTokenValue("internal").header("alg", "RS256").subject(target.toString())
                .issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(60))
                .claim("deletion_target", target.toString())
                .claim("internal_account_deletion", true)
                .claim("permissions", List.of("INTERNAL_ACCOUNT_DELETE")).build();
        var authentication = new JwtAuthenticationToken(token,
                List.of(new SimpleGrantedAuthority("PERMISSION_INTERNAL_ACCOUNT_DELETE")));
        assertTrue(authorization.canDelete(authentication, target));
        assertFalse(authorization.canDelete(authentication, UUID.randomUUID()));
        assertTrue(new SessionStatusValidator("http://localhost:1/unreachable")
                .validate(token).getErrors().isEmpty());
    }
}
