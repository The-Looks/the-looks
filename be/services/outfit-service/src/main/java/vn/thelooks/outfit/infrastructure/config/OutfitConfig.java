package vn.thelooks.outfit.infrastructure.config;

import java.time.Clock;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import vn.thelooks.observability.CorrelationIdForwardingInterceptor;
import vn.thelooks.security.BearerTokenForwardingInterceptor;

@Configuration
class OutfitConfig {

    /** Inject Clock thay vì gọi Instant.now() trực tiếp, để test cố định được thời gian. */
    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }

    @Bean
    RestClient wardrobeRestClient(@Value("${thelooks.services.wardrobe-url}") String wardrobeUrl,
            BearerTokenForwardingInterceptor bearerToken, CorrelationIdForwardingInterceptor correlationId) {
        var requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(2));
        requestFactory.setReadTimeout(Duration.ofSeconds(5));
        return RestClient.builder()
                .baseUrl(wardrobeUrl)
                .requestFactory(requestFactory)
                .requestInterceptor(bearerToken)
                .requestInterceptor(correlationId)
                .build();
    }
}
