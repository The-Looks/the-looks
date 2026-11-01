package vn.thelooks.identity.infrastructure.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Locale;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import vn.thelooks.identity.application.port.out.GoogleTokenVerifier;
import vn.thelooks.identity.domain.exception.InvalidCredentialsException;

@Component
class GoogleOidcTokenVerifier implements GoogleTokenVerifier {

    private final RestClient http = RestClient.create();
    private final NimbusJwtDecoder decoder;
    private final String clientId;
    private final String clientSecret;
    private final String redirectUri;

    GoogleOidcTokenVerifier(@Value("${thelooks.google.client-id:}") String clientId,
            @Value("${thelooks.google.client-secret:}") String clientSecret,
            @Value("${thelooks.google.redirect-uri:}") String redirectUri) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectUri = redirectUri;
        decoder = NimbusJwtDecoder.withJwkSetUri("https://www.googleapis.com/oauth2/v3/certs").build();
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer("https://accounts.google.com"));
    }

    @Override
    public Profile exchangeAndVerify(String code, String codeVerifier, String expectedNonce) {
        try {
            var form = new LinkedMultiValueMap<String, String>();
            form.add("code", code);
            form.add("client_id", clientId);
            form.add("client_secret", clientSecret);
            form.add("redirect_uri", redirectUri);
            form.add("code_verifier", codeVerifier);
            form.add("grant_type", "authorization_code");
            @SuppressWarnings("unchecked")
            Map<String, Object> body = http.post().uri("https://oauth2.googleapis.com/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED).body(form).retrieve().body(Map.class);
            if (body == null || !(body.get("id_token") instanceof String idToken)) throw invalid();
            var jwt = decoder.decode(idToken);
            if (!jwt.getAudience().contains(clientId) || !same(expectedNonce, jwt.getClaimAsString("nonce"))) {
                throw invalid();
            }
            var subject = jwt.getSubject();
            var email = jwt.getClaimAsString("email");
            if (subject == null || subject.isBlank() || email == null || email.isBlank()) throw invalid();
            email = email.toLowerCase(Locale.ROOT);
            var verified = Boolean.TRUE.equals(jwt.getClaim("email_verified"));
            var hostedDomain = jwt.getClaimAsString("hd");
            var authoritative = email.endsWith("@gmail.com")
                    || (hostedDomain != null && email.endsWith("@" + hostedDomain.toLowerCase(Locale.ROOT)));
            return new Profile(subject, email, verified, jwt.getClaimAsString("name"), authoritative);
        } catch (JwtException | RestClientException e) {
            throw invalid();
        }
    }

    private static boolean same(String expected, String actual) {
        return actual != null && MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),
                actual.getBytes(StandardCharsets.UTF_8));
    }

    private static InvalidCredentialsException invalid() {
        return new InvalidCredentialsException("Google đăng nhập không hợp lệ");
    }
}
