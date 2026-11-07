package vn.thelooks.auth.application.service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import vn.thelooks.auth.application.port.out.PasswordHasher;
import vn.thelooks.auth.application.port.in.SetPasswordUseCase;
import vn.thelooks.auth.application.port.out.PasswordSetupRepositoryPort;
import vn.thelooks.auth.domain.model.PasswordPolicy;

@Service
public class PasswordSetupService implements SetPasswordUseCase {
    private final PasswordSetupRepositoryPort store;
    private final PasswordHasher hasher;
    private final Clock clock;

    PasswordSetupService(PasswordSetupRepositoryPort store, PasswordHasher hasher, Clock clock) {
        this.store = store;
        this.hasher = hasher;
        this.clock = clock;
    }

    public boolean hasPassword(UUID userId) { return store.hasPassword(userId); }

    public void setup(UUID userId, UUID sessionId, String password) {
        if (password == null || password.length() < PasswordPolicy.MIN_LENGTH || password.length() > 256)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu phải có từ 8 đến 256 ký tự");
        if (!store.isRecentGoogleSession(userId, sessionId, Instant.now(clock).minus(Duration.ofMinutes(10))))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Hãy đăng nhập lại bằng Google rồi đặt mật khẩu trong 10 phút");
        if (!store.setIfAbsent(userId, hasher.hash(password)))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tài khoản đã có mật khẩu");
    }
}
