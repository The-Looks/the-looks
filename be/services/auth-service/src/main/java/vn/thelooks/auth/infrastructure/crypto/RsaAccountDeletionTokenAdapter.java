package vn.thelooks.auth.infrastructure.crypto;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Component;
import vn.thelooks.auth.application.port.out.AccountDeletionTokenPort;

@Component
class RsaAccountDeletionTokenAdapter implements AccountDeletionTokenPort {
    private final JwtEncoder encoder;
    private final Clock clock;
    private final String issuer;
    private final String keyId;

    RsaAccountDeletionTokenAdapter(JwtEncoder encoder, Clock clock,
            @Value("${thelooks.security.issuer}") String issuer, com.nimbusds.jose.jwk.RSAKey key) {
        this.encoder = encoder;
        this.clock = clock;
        this.issuer = issuer;
        this.keyId = key.getKeyID();
    }

    public String issue(UUID targetId) {
        Instant now = Instant.now(clock);
        var claims = JwtClaimsSet.builder().issuer(issuer).subject(targetId.toString()).issuedAt(now)
                .expiresAt(now.plus(Duration.ofMinutes(5)))
                .claim("permissions", List.of("INTERNAL_ACCOUNT_DELETE"))
                .claim("deletion_target", targetId.toString())
                .claim("internal_account_deletion", true).build();
        return encoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(SignatureAlgorithm.RS256).keyId(keyId).build(), claims)).getTokenValue();
    }
}
