package vn.thelooks.voting.infrastructure.ratelimit;

import java.time.Clock;
import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;
import vn.thelooks.voting.application.port.out.VoteThrottle;

/** Tối đa 10 phiếu mỗi IP trong 1 phút (cửa sổ trượt). */
// ponytail: đếm trong bộ nhớ một tiến trình; chạy nhiều bản voting-service thì chuyển sang Redis / bảng đếm chung
@Component
class InMemoryVoteThrottle implements VoteThrottle {

    static final int MAX_PER_WINDOW = 10;
    static final Duration WINDOW = Duration.ofMinutes(1);
    /** Chặn bảng đếm phình mãi khi bị quét nhiều IP. */
    static final int MAX_TRACKED_IPS = 50_000;

    private final ConcurrentHashMap<String, Deque<Long>> hits = new ConcurrentHashMap<>();
    private final Clock clock;

    InMemoryVoteThrottle(Clock clock) {
        this.clock = clock;
    }

    @Override
    public boolean tryAcquire(String ip) {
        long now = clock.millis();
        if (hits.size() > MAX_TRACKED_IPS) {
            hits.clear();
        }
        Deque<Long> times = hits.computeIfAbsent(ip == null ? "" : ip, k -> new ArrayDeque<>());
        synchronized (times) {
            while (!times.isEmpty() && now - times.peekFirst() >= WINDOW.toMillis()) {
                times.pollFirst();
            }
            if (times.size() >= MAX_PER_WINDOW) {
                return false;
            }
            times.addLast(now);
            return true;
        }
    }
}
