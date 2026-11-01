package vn.thelooks.wardrobe.infrastructure.config;

import java.time.Clock;
import java.time.Duration;
import java.util.concurrent.Executor;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import vn.thelooks.observability.CorrelationIdForwardingInterceptor;
import vn.thelooks.security.BearerTokenForwardingInterceptor;

@Configuration
class WardrobeConfig {

    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }

    // ponytail: quét chạy nền trong cùng tiến trình, mất việc dở nếu service khởi động lại giữa chừng (scan kẹt PROCESSING);
    // chuyển sang hàng đợi bền (bảng job / message broker) khi lượng quét lớn
    @Bean(destroyMethod = "close")
    ExecutorService scanExecutor() {
        return Executors.newVirtualThreadPerTaskExecutor();
    }

    @Bean
    RestClient billingRestClient(@Value("${thelooks.services.billing-url}") String billingUrl,
            BearerTokenForwardingInterceptor bearerToken, CorrelationIdForwardingInterceptor correlationId) {
        var requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(2));
        requestFactory.setReadTimeout(Duration.ofSeconds(3));
        return RestClient.builder()
                .baseUrl(billingUrl)
                .requestFactory(requestFactory)
                .requestInterceptor(bearerToken)
                .requestInterceptor(correlationId)
                .build();
    }
}
