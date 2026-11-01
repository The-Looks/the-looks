package vn.thelooks.billing.infrastructure.config;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class BillingConfig {

    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }
}
