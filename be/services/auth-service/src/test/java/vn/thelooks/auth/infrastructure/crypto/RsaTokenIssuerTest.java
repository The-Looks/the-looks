package vn.thelooks.auth.infrastructure.crypto;

import static org.junit.jupiter.api.Assertions.assertThrows;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import vn.thelooks.auth.domain.enums.UserStatus;
import vn.thelooks.auth.domain.model.User;

class RsaTokenIssuerTest {
    @Test
    void expiredAccessTokenIsRejectedByTheProductionJwtValidator() throws Exception {
        var key = new RSAKeyGenerator(2048).keyID("test-key").generate();
        var issuedAt = Instant.parse("2000-01-01T00:00:00Z");
        var encoder = new NimbusJwtEncoder(new ImmutableJWKSet<>(new JWKSet(key)));
        var issuer = new RsaTokenIssuer(encoder, Clock.fixed(issuedAt, ZoneOffset.UTC), "thelooks-test", key);
        var user = new User(UUID.randomUUID(), "person@example.com", "hash", "Person", true,
                Set.of("USER"), Set.of("ACCOUNT_READ_SELF"), UserStatus.ACTIVE, issuedAt, issuedAt);
        String token = issuer.issue(user, UUID.randomUUID()).token();
        var decoder = NimbusJwtDecoder.withPublicKey(key.toRSAPublicKey()).build();
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer("thelooks-test"));
        assertThrows(JwtException.class, () -> decoder.decode(token));
    }
}
