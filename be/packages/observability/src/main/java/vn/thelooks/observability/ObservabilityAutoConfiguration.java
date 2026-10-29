package vn.thelooks.observability;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;

@AutoConfiguration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
public class ObservabilityAutoConfiguration {

    @Bean
    CorrelationIdFilter correlationIdFilter() {
        return new CorrelationIdFilter();
    }

    @Bean
    CorrelationIdForwardingInterceptor correlationIdForwardingInterceptor() {
        return new CorrelationIdForwardingInterceptor();
    }
}
