package vn.thelooks.auth.presentation.controller;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;

class LoginThrottleTest {

    final AtomicReference<Instant> now = new AtomicReference<>(Instant.parse("2026-11-08T00:00:00Z"));
    final LoginThrottle throttle = new LoginThrottle(new Clock() {
        public ZoneId getZone() { return ZoneId.of("UTC"); }
        public Clock withZone(ZoneId zone) { return this; }
        public Instant instant() { return now.get(); }
    });

    @Test
    void blocksAnEmailAfterFiveWrongPasswordsUntilTheWindowPasses() {
        for (int i = 0; i < 5; i++) {
            assertThat(throttle.blocked("Lan@Example.com", "1.1.1.1")).isEmpty();
            throttle.failed("lan@example.com ", "1.1.1." + i);
        }
        assertThat(throttle.blocked("lan@example.com", "9.9.9.9")).contains(Duration.ofMinutes(15));
        assertThat(throttle.blocked("other@example.com", "9.9.9.9")).isEmpty();
        now.set(now.get().plus(Duration.ofMinutes(15)));
        assertThat(throttle.blocked("lan@example.com", "9.9.9.9")).isEmpty();
    }

    @Test
    void blocksAnIpTryingManyEmailsAndASuccessResetsTheEmail() {
        for (int i = 0; i < 20; i++) throttle.failed("user" + i + "@example.com", "6.6.6.6");
        assertThat(throttle.blocked("new@example.com", "6.6.6.6")).isPresent();
        assertThat(throttle.blocked("new@example.com", "7.7.7.7")).isEmpty();

        for (int i = 0; i < 4; i++) throttle.failed("lan@example.com", "1.1.1.1");
        throttle.succeeded("lan@example.com");
        throttle.failed("lan@example.com", "1.1.1.1");
        assertThat(throttle.blocked("lan@example.com", "2.2.2.2")).isEmpty();
    }
}
