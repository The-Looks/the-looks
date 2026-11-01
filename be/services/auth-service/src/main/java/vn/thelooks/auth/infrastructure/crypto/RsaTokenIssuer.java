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
import vn.thelooks.auth.application.port.out.TokenIssuer;
import vn.thelooks.auth.domain.model.User;

@Component
class RsaTokenIssuer implements TokenIssuer {

    private final JwtEncoder encoder;
    private final Clock clock;
    private final String issuer;
    private final String kid;

    RsaTokenIssuer(JwtEncoder encoder, Clock clock, @Value("${thelooks.security.issuer}") String issuer,
            com.nimbusds.jose.jwk.RSAKey key) {
        this.encoder = encoder;
        this.clock = clock;
        this.issuer = issuer;
        this.kid = key.getKeyID();
    }

    @Override
    public IssuedToken issue(User user, UUID sessionId) {
        var now = Instant.now(clock);
        var expiresAt = now.plus(Duration.ofMinutes(30));
        var claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .subject(user.id().toString())
                .issuedAt(now)
                .expiresAt(expiresAt)
                .claim("roles", List.of(user.role().name()))
                .claim("sid", sessionId.toString())
                .build();
        var header = JwsHeader.with(SignatureAlgorithm.RS256).keyId(kid).build();
        return new IssuedToken(encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue(), expiresAt);
    }
}
