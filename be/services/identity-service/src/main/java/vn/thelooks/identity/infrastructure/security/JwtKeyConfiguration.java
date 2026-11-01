package vn.thelooks.identity.infrastructure.security;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.KeyUse;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.MessageDigest;
import java.security.interfaces.RSAPrivateCrtKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.RSAPublicKeySpec;
import java.time.Clock;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import vn.thelooks.identity.application.port.out.RefreshSessionStore;

@Configuration
class JwtKeyConfiguration {

    @Bean
    RSAKey signingKey(@Value("${thelooks.security.private-key-path}") String path) throws Exception {
        var pem = Files.readString(Path.of(path));
        var base64 = pem.replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", "");
        var privateKey = (RSAPrivateCrtKey) KeyFactory.getInstance("RSA")
                .generatePrivate(new PKCS8EncodedKeySpec(Base64.getDecoder().decode(base64)));
        if (privateKey.getModulus().bitLength() < 2048) {
            throw new IllegalArgumentException("JWT RSA key phải có ít nhất 2048 bit");
        }
        var publicKey = (RSAPublicKey) KeyFactory.getInstance("RSA")
                .generatePublic(new RSAPublicKeySpec(privateKey.getModulus(), privateKey.getPublicExponent()));
        var fingerprint = MessageDigest.getInstance("SHA-256").digest(publicKey.getEncoded());
        var kid = Base64.getUrlEncoder().withoutPadding().encodeToString(fingerprint).substring(0, 16);
        return new RSAKey.Builder(publicKey)
                .privateKey(privateKey)
                .keyID(kid)
                .keyUse(KeyUse.SIGNATURE)
                .algorithm(JWSAlgorithm.RS256)
                .build();
    }

    @Bean
    JwtEncoder jwtEncoder(RSAKey key) {
        JWKSource<SecurityContext> source = (selector, context) -> selector.select(new JWKSet(key));
        return new NimbusJwtEncoder(source);
    }

    /** Identity kiểm tra JWT bằng public key tại chỗ, không gọi HTTP tới chính nó. */
    @Bean
    JwtDecoder jwtDecoder(RSAKey key, @Value("${thelooks.security.issuer}") String issuer,
            RefreshSessionStore sessions, Clock clock) throws Exception {
        var decoder = NimbusJwtDecoder.withPublicKey(key.toRSAPublicKey()).build();
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefaultWithIssuer(issuer),
                jwt -> {
                    try {
                        var sid = UUID.fromString(jwt.getClaimAsString("sid"));
                        var uid = UUID.fromString(jwt.getSubject());
                        return sessions.isActive(sid, uid, Instant.now(clock))
                                ? OAuth2TokenValidatorResult.success()
                                : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Phiên đã thu hồi", null));
                    } catch (IllegalArgumentException | NullPointerException e) {
                        return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Thiếu phiên đăng nhập", null));
                    }
                }));
        return decoder;
    }
}
