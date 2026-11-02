package vn.thelooks.voting.infrastructure.ratelimit;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

class InMemoryVoteThrottleTest {

    Instant now = Instant.parse("2026-11-01T03:00:00Z");
    final InMemoryVoteThrottle throttle = new InMemoryVoteThrottle(new Clock() {
        public ZoneId getZone() { return ZoneOffset.UTC; }
        public Clock withZone(ZoneId zone) { return this; }
        public Instant instant() { return now; }
    });

    @Test
    void allowsTenVotesPerMinutePerIp() {
        for (int i = 0; i < InMemoryVoteThrottle.MAX_PER_WINDOW; i++) {
            assertThat(throttle.tryAcquire("1.1.1.1")).isTrue();
        }
        assertThat(throttle.tryAcquire("1.1.1.1")).isFalse();
        assertThat(throttle.tryAcquire("2.2.2.2")).isTrue();
        now = now.plusSeconds(61);
        assertThat(throttle.tryAcquire("1.1.1.1")).isTrue();
    }
}
