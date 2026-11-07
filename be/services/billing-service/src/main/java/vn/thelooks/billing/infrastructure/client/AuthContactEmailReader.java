package vn.thelooks.billing.infrastructure.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.Duration;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import vn.thelooks.billing.application.port.out.ContactEmailReader;
import vn.thelooks.security.BearerTokenForwardingInterceptor;

/** GET /api/app/me của auth-service bằng JWT của người đang thanh toán. */
@Component
class AuthContactEmailReader implements ContactEmailReader {

    private static final Logger log = LoggerFactory.getLogger(AuthContactEmailReader.class);

    private final RestClient auth;

    AuthContactEmailReader(@Value("${thelooks.services.auth-url}") String authUrl,
            BearerTokenForwardingInterceptor bearerToken) {
        var requests = new SimpleClientHttpRequestFactory();
        requests.setConnectTimeout(Duration.ofSeconds(3));
        requests.setReadTimeout(Duration.ofSeconds(5));
        this.auth = RestClient.builder().baseUrl(authUrl).requestFactory(requests).requestInterceptor(bearerToken).build();
    }

    @Override
    public Optional<String> currentUserEmail() {
        try {
            Me me = auth.get().uri("/api/app/me").retrieve().body(Me.class);
            return Optional.ofNullable(me).map(Me::email).filter(e -> !e.isBlank());
        } catch (RestClientException e) {
            log.warn("Không hỏi được email từ auth-service: {}", e.getMessage());
            return Optional.empty();
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Me(String email) {
    }
}
