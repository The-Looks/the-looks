package vn.thelooks.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.security.KeyPairGenerator;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.Jwt;

class JwtSecurityAutoConfigurationTest {

    @Test
    void mapsDatabaseBackedPermissionsAndRolesToAuthorities() {
        var jwt = Jwt.withTokenValue("token").header("alg", "RS256")
                .claim("roles", List.of("USER", "ADMIN"))
                .claim("permissions", List.of("ACCOUNT_READ_SELF", "ADMIN_ACCESS", "ROLE_MANAGE"))
                .build();
        var authentication = new JwtSecurityAutoConfiguration().jwtAuthenticationConverter().convert(jwt);

        assertTrue(authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
        assertTrue(authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("PERMISSION_ADMIN_ACCESS")));
        assertTrue(authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("PERMISSION_ROLE_MANAGE")));
    }

    @Test
    void verifiesRs256SignatureAndIssuerFromJwks() throws Exception {
        var keyPairGenerator = KeyPairGenerator.getInstance("RSA");
        keyPairGenerator.initialize(2048);
        var keyPair = keyPairGenerator.generateKeyPair();
        var jwk = new RSAKey.Builder((java.security.interfaces.RSAPublicKey) keyPair.getPublic())
                .keyID("key-1")
                .build();
        var jwks = new JWKSet(jwk).toPublicJWKSet().toString().getBytes(StandardCharsets.UTF_8);
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/.well-known/jwks.json", exchange -> {
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, jwks.length);
            try (var response = exchange.getResponseBody()) {
                response.write(jwks);
            }
        });
        server.start();
        try {
            var issuer = "http://localhost:8081";
            var jwkSetUri = "http://127.0.0.1:" + server.getAddress().getPort() + "/.well-known/jwks.json";
            var decoder = new JwtSecurityAutoConfiguration().jwtDecoder(jwkSetUri, issuer, "");
            assertEquals("user-1", decoder.decode(token(keyPair.getPrivate(), issuer)).getSubject());
            assertThrows(JwtException.class, () -> decoder.decode(token(keyPair.getPrivate(), "wrong-issuer")));

            var otherKeyPair = keyPairGenerator.generateKeyPair();
            assertThrows(JwtException.class, () -> decoder.decode(token(otherKeyPair.getPrivate(), issuer)));
        } finally {
            server.stop(0);
        }
    }

    private static String token(java.security.PrivateKey privateKey, String issuer) throws Exception {
        var claims = new JWTClaimsSet.Builder()
                .subject("user-1")
                .issuer(issuer)
                .issueTime(Date.from(Instant.now()))
                .expirationTime(Date.from(Instant.now().plusSeconds(300)))
                .build();
        var jwt = new SignedJWT(new JWSHeader.Builder(JWSAlgorithm.RS256).keyID("key-1").build(), claims);
        jwt.sign(new RSASSASigner(privateKey));
        return jwt.serialize();
    }
}
