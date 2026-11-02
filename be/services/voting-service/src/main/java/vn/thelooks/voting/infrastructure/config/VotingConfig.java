package vn.thelooks.voting.infrastructure.config;

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
class VotingConfig {

    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }

    @Bean
    RestClient outfitRestClient(@Value("${thelooks.services.outfit-url}") String outfitUrl,
            BearerTokenForwardingInterceptor bearerToken, CorrelationIdForwardingInterceptor correlationId) {
        var requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(2));
        requestFactory.setReadTimeout(Duration.ofSeconds(5));
        return RestClient.builder()
                .baseUrl(outfitUrl)
                .requestFactory(requestFactory)
                .requestInterceptor(bearerToken)
                .requestInterceptor(correlationId)
                .build();
    }
}
