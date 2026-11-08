package vn.thelooks.auth.presentation.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.Clock;
import java.time.Instant;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.auth.application.port.out.UserPersistencePort;
import vn.thelooks.auth.application.port.out.RefreshTokenSessionStore;
import vn.thelooks.auth.domain.exception.InvalidCredentialsException;
import vn.thelooks.auth.presentation.advice.TooManyLoginAttemptsException;
import vn.thelooks.auth.application.port.in.LoginUseCase;
import vn.thelooks.auth.application.port.in.RegisterUseCase;
import vn.thelooks.auth.application.port.in.SessionUseCase;
import vn.thelooks.auth.domain.exception.InvalidCredentialsException;
import vn.thelooks.auth.domain.model.PasswordPolicy;
import vn.thelooks.auth.domain.enums.UserStatus;
import vn.thelooks.auth.presentation.advice.ForbiddenOriginException;
import vn.thelooks.auth.presentation.mapper.UserResponseMapper;
import vn.thelooks.auth.presentation.request.LoginRequest;
import vn.thelooks.auth.presentation.request.RegisterRequest;
import vn.thelooks.auth.presentation.response.SessionResponse;
import vn.thelooks.auth.presentation.response.PasswordPolicyResponse;
import vn.thelooks.auth.presentation.response.UserResponse;
import vn.thelooks.security.CurrentUser;

@RestController
@RequestMapping("/api")
class AuthController {

    private final RegisterUseCase register;
    private final LoginUseCase login;
    private final SessionUseCase sessions;
    private final UserPersistencePort users;
    private final RefreshTokenSessionStore refreshSessions;
    private final Clock clock;
    private final String allowedOrigin;
    private final LoginThrottle throttle;

    AuthController(RegisterUseCase register, LoginUseCase login, SessionUseCase sessions, UserPersistencePort users,
            RefreshTokenSessionStore refreshSessions, Clock clock,
            @Value("${thelooks.security.web-origin}") String allowedOrigin, LoginThrottle throttle) {
        this.register = register;
        this.login = login;
        this.sessions = sessions;
        this.users = users;
        this.refreshSessions = refreshSessions;
        this.clock = clock;
        this.allowedOrigin = allowedOrigin;
        this.throttle = throttle;
    }

    @PostMapping("/public/auth/register")
    ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest body, HttpServletRequest request) {
        requireOrigin(request);
        var user = register.register(new RegisterUseCase.RegisterCommand(body.email(), body.password(), body.username()));
        return ResponseEntity.status(HttpStatus.CREATED).body(UserResponseMapper.from(user));
    }

    @GetMapping("/public/auth/password-policy")
    PasswordPolicyResponse passwordPolicy() {
        return new PasswordPolicyResponse(PasswordPolicy.MIN_LENGTH, PasswordPolicy.STRONG_LENGTH,
                PasswordPolicy.RECOMMENDED_CHARACTER_TYPES);
    }

    @PostMapping("/public/auth/login")
    ResponseEntity<SessionResponse> login(@Valid @RequestBody LoginRequest body, HttpServletRequest request) {
        requireOrigin(request);
        String ip = request.getRemoteAddr(); // IP thật nhờ server.forward-headers-strategy=framework
        throttle.blocked(body.email(), ip).ifPresent(wait -> { throw new TooManyLoginAttemptsException(wait); });
        LoginUseCase.AuthTokens tokens;
        try {
            tokens = login.login(body.email(), body.password());
        } catch (InvalidCredentialsException e) {
            throttle.failed(body.email(), ip);
            throw e;
        }
        throttle.succeeded(body.email());
        return tokenResponse(tokens, request);
    }

    @PostMapping("/public/auth/refresh")
    ResponseEntity<SessionResponse> refresh(@CookieValue(name = "refresh_token", required = false) String refreshToken,
            HttpServletRequest request) {
        requireCookieOrigin(request);
        return tokenResponse(sessions.refresh(refreshToken), request);
    }

    @PostMapping("/public/auth/logout")
    ResponseEntity<Void> logout(@CookieValue(name = "refresh_token", required = false) String refreshToken,
            HttpServletRequest request) {
        requireCookieOrigin(request);
        sessions.logout(refreshToken);
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, AuthCookies.clearRefresh(request).toString())
                .header(HttpHeaders.SET_COOKIE, AuthCookies.clearAccess(request).toString())
                .header(HttpHeaders.CACHE_CONTROL, "no-store").build();
    }

    @GetMapping("/app/me")
    UserResponse me(@AuthenticationPrincipal Jwt jwt) {
        return users.findById(CurrentUser.id(jwt)).filter(user -> user.status() == UserStatus.ACTIVE)
                .map(UserResponseMapper::from)
                .orElseThrow(() -> new InvalidCredentialsException("Tài khoản không tồn tại"));
    }

    @GetMapping("/public/auth/session/active")
    ResponseEntity<Void> activeSession(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) throw new InvalidCredentialsException("Phiên đăng nhập không hợp lệ");
        try {
            var userId = CurrentUser.id(jwt);
            var sessionId = UUID.fromString(jwt.getClaimAsString("sid"));
            if (!refreshSessions.isActive(sessionId, userId, Instant.now(clock))
                    || users.findById(userId).filter(user -> user.status() == UserStatus.ACTIVE).isEmpty())
                throw new InvalidCredentialsException("Phiên đăng nhập không hợp lệ");
        } catch (IllegalArgumentException | NullPointerException invalid) {
            throw new InvalidCredentialsException("Phiên đăng nhập không hợp lệ");
        }
        return ResponseEntity.noContent().header(HttpHeaders.CACHE_CONTROL, "no-store").build();
    }

    private ResponseEntity<SessionResponse> tokenResponse(LoginUseCase.AuthTokens tokens, HttpServletRequest request) {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, AuthCookies.refresh(tokens, request).toString())
                .header(HttpHeaders.SET_COOKIE, AuthCookies.access(tokens, request).toString())
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(new SessionResponse(tokens.expiresAt()));
    }

    private void requireOrigin(HttpServletRequest request) {
        var origin = request.getHeader(HttpHeaders.ORIGIN);
        if (origin != null && !origin.equals(allowedOrigin)) {
            throw new ForbiddenOriginException();
        }
    }

    private void requireCookieOrigin(HttpServletRequest request) {
        if (!allowedOrigin.equals(request.getHeader(HttpHeaders.ORIGIN))) {
            throw new ForbiddenOriginException();
        }
    }

}
