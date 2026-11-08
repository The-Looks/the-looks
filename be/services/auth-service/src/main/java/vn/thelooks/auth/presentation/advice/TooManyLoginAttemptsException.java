package vn.thelooks.auth.presentation.advice;

import java.time.Duration;

/** Sai mật khẩu quá nhiều lần: trả 429 kèm số phút phải chờ. */
public class TooManyLoginAttemptsException extends RuntimeException {

    private final Duration wait;

    public TooManyLoginAttemptsException(Duration wait) {
        super("Bạn đăng nhập sai nhiều lần. Thử lại sau " + Math.max(1, (wait.toSeconds() + 59) / 60) + " phút.");
        this.wait = wait;
    }

    public Duration retryAfter() {
        return wait;
    }
}
