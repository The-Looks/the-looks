package vn.thelooks.shared;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Inject Clock thay vì gọi Instant.now() trực tiếp, để test cố định được thời gian. */
@Configuration
class TimeConfig {

    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }
}
