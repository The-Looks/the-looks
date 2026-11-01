package vn.thelooks.security;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

/** Kiểm tra trạng thái phiên ở identity service để token đã thu hồi bị từ chối ngay. */
final class SessionStatusValidator implements OAuth2TokenValidator<Jwt> {

    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build();
    private final URI uri;

    SessionStatusValidator(String uri) {
        this.uri = URI.create(uri);
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt jwt) {
        if (jwt.getClaimAsString("sid") == null) return invalid();
        var request = HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(3))
                .header("Authorization", "Bearer " + jwt.getTokenValue()).GET().build();
        try {
            return http.send(request, HttpResponse.BodyHandlers.discarding()).statusCode() == 204
                    ? OAuth2TokenValidatorResult.success() : invalid();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return invalid();
        } catch (IOException e) {
            return invalid();
        }
    }

    private static OAuth2TokenValidatorResult invalid() {
        return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Phiên không hoạt động", null));
    }
}
