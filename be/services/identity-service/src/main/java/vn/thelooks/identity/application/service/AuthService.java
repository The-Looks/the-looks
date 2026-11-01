package vn.thelooks.identity.application.service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;
import vn.thelooks.identity.application.port.out.PasswordHasher;
import vn.thelooks.identity.application.port.out.RefreshSessionStore;
import vn.thelooks.identity.application.port.out.TokenIssuer;
import vn.thelooks.identity.application.port.out.UserRepository;
import vn.thelooks.identity.application.usecase.LoginUseCase;
import vn.thelooks.identity.application.usecase.RegisterUseCase;
import vn.thelooks.identity.application.usecase.SessionUseCase;
import vn.thelooks.identity.domain.exception.InvalidCredentialsException;
import vn.thelooks.identity.domain.exception.UserAlreadyExistsException;
import vn.thelooks.identity.domain.model.Role;
import vn.thelooks.identity.domain.model.User;
import vn.thelooks.identity.domain.model.UserStatus;

@Service
class AuthService implements RegisterUseCase, LoginUseCase, SessionUseCase {

    private final UserRepository users;
    private final PasswordHasher passwords;
    private final RefreshSessionStore sessions;
    private final TokenIssuer tokens;
    private final Clock clock;
    private final String dummyHash;

    AuthService(UserRepository users, PasswordHasher passwords, RefreshSessionStore sessions,
            TokenIssuer tokens, Clock clock) {
        this.users = users;
        this.passwords = passwords;
        this.sessions = sessions;
        this.tokens = tokens;
        this.clock = clock;
        this.dummyHash = passwords.hash(UUID.randomUUID().toString());
    }

    @Override
    public User register(RegisterCommand command) {
        var email = command.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmail(email)) throw new UserAlreadyExistsException("Email đã được sử dụng");
        var now = Instant.now(clock);
        return users.save(new User(UUID.randomUUID(), email, passwords.hash(command.password()),
                command.username().trim(), false, Role.USER, UserStatus.ACTIVE, now, now));
    }

    @Override
    public AuthTokens login(String email, String password) {
        var user = users.findByEmail(email.trim().toLowerCase(Locale.ROOT)).orElse(null);
        if (user == null) {
            passwords.matches(password, dummyHash);
            throw invalid();
        }
        if (user.status() != UserStatus.ACTIVE || !passwords.matches(password, user.passwordHash())) throw invalid();
        return issueSession(user);
    }

    @Override
    public AuthTokens refresh(String refreshToken) {
        var rotation = sessions.rotate(refreshToken, Instant.now(clock));
        if (rotation.status() != RefreshSessionStore.Rotation.Status.OK) throw invalid();
        var user = users.findById(rotation.userId()).orElseThrow(AuthService::invalid);
        if (user.status() != UserStatus.ACTIVE) {
            sessions.revoke(rotation.refreshToken(), Instant.now(clock));
            throw invalid();
        }
        var access = tokens.issue(user, rotation.sessionId());
        return new AuthTokens(access.token(), access.expiresAt(), rotation.refreshToken(), rotation.expiresAt());
    }

    @Override
    public void logout(String refreshToken) {
        sessions.revoke(refreshToken, Instant.now(clock));
    }

    private AuthTokens issueSession(User user) {
        var now = Instant.now(clock);
        var session = sessions.create(user.id(), now, now.plus(Duration.ofDays(7)));
        var access = tokens.issue(user, session.id());
        return new AuthTokens(access.token(), access.expiresAt(), session.refreshToken(), session.expiresAt());
    }

    private static InvalidCredentialsException invalid() {
        return new InvalidCredentialsException("Thông tin đăng nhập không hợp lệ");
    }
}
