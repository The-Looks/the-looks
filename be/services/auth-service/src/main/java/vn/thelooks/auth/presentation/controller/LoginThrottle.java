package vn.thelooks.auth.presentation.controller;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

/**
 * Chống dò mật khẩu (OWASP Authentication Cheat Sheet): sai quá {@link #PER_EMAIL} lần cho một email, hoặc quá
 * {@link #PER_IP} lần từ một IP trong {@link #WINDOW}, thì tạm chặn đăng nhập tới khi lần sai cũ nhất hết hạn.
 * Đăng nhập đúng xoá bộ đếm của email đó.
 */
// ponytail: đếm trong RAM của một máy; chạy nhiều máy thì chuyển sang bảng DB / Redis dùng chung
@Component
class LoginThrottle {

    static final Duration WINDOW = Duration.ofMinutes(15);
    static final int PER_EMAIL = 5;
    static final int PER_IP = 20;
    private static final int MAX_KEYS = 50_000;

    private final Map<String, Deque<Instant>> failures = new ConcurrentHashMap<>();
    private final Clock clock;

    LoginThrottle(Clock clock) {
        this.clock = clock;
    }

    /** Thời gian còn phải chờ; rỗng = được thử. */
    Optional<Duration> blocked(String email, String ip) {
        Instant now = clock.instant();
        return wait(emailKey(email), PER_EMAIL, now).or(() -> wait("ip:" + ip, PER_IP, now));
    }

    void failed(String email, String ip) {
        if (failures.size() > MAX_KEYS) failures.clear(); // bị dội quá nhiều email lạ: bỏ bớt bộ nhớ, vẫn an toàn
        Instant now = clock.instant();
        for (String key : new String[] {emailKey(email), "ip:" + ip}) {
            failures.compute(key, (k, times) -> {
                Deque<Instant> list = times == null ? new ArrayDeque<>() : times;
                prune(list, now);
                list.addLast(now);
                return list;
            });
        }
    }

    void succeeded(String email) {
        failures.remove(emailKey(email));
    }

    private Optional<Duration> wait(String key, int limit, Instant now) {
        Deque<Instant> times = failures.get(key);
        if (times == null) return Optional.empty();
        synchronized (times) {
            prune(times, now);
            if (times.size() < limit) return Optional.empty();
            return Optional.of(Duration.between(now, times.peekFirst().plus(WINDOW)));
        }
    }

    private static void prune(Deque<Instant> times, Instant now) {
        while (!times.isEmpty() && !times.peekFirst().plus(WINDOW).isAfter(now)) times.removeFirst();
    }

    private static String emailKey(String email) {
        return "email:" + (email == null ? "" : email.trim().toLowerCase(Locale.ROOT));
    }
}
