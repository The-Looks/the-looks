package vn.thelooks.auth.presentation.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.Duration;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.auth.application.port.out.UserRepository;
import vn.thelooks.auth.application.port.in.LoginUseCase;
import vn.thelooks.auth.application.port.in.RegisterUseCase;
import vn.thelooks.auth.application.port.in.SessionUseCase;
import vn.thelooks.auth.domain.exception.InvalidCredentialsException;
import vn.thelooks.auth.presentation.advice.ForbiddenOriginException;
import vn.thelooks.auth.presentation.mapper.UserResponseMapper;
import vn.thelooks.auth.presentation.request.LoginRequest;
import vn.thelooks.auth.presentation.request.RegisterRequest;
import vn.thelooks.auth.presentation.response.AccessTokenResponse;
import vn.thelooks.auth.presentation.response.UserResponse;
import vn.thelooks.security.CurrentUser;

@RestController
@RequestMapping("/api")
class AuthController {

    private final RegisterUseCase register;
    private final LoginUseCase login;
    private final SessionUseCase sessions;
    private final UserRepository users;
    private final String allowedOrigin;

    AuthController(RegisterUseCase register, LoginUseCase login, SessionUseCase sessions, UserRepository users,
            @Value("${thelooks.security.web-origin}") String allowedOrigin) {
        this.register = register;
        this.login = login;
        this.sessions = sessions;
        this.users = users;
        this.allowedOrigin = allowedOrigin;
    }

    @PostMapping("/public/auth/register")
    ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest body, HttpServletRequest request) {
        requireOrigin(request);
        var user = register.register(new RegisterUseCase.RegisterCommand(body.email(), body.password(), body.username()));
        return ResponseEntity.status(HttpStatus.CREATED).body(UserResponseMapper.from(user));
    }

    @PostMapping("/public/auth/login")
    ResponseEntity<AccessTokenResponse> login(@Valid @RequestBody LoginRequest body, HttpServletRequest request) {
        requireOrigin(request);
        return tokenResponse(login.login(body.email(), body.password()), request);
    }

    @PostMapping("/public/auth/refresh")
    ResponseEntity<AccessTokenResponse> refresh(@CookieValue(name = "refresh_token", required = false) String refreshToken,
            HttpServletRequest request) {
        requireOrigin(request);
        return tokenResponse(sessions.refresh(refreshToken), request);
    }

    @PostMapping("/public/auth/logout")
    ResponseEntity<Void> logout(@CookieValue(name = "refresh_token", required = false) String refreshToken,
            HttpServletRequest request) {
        requireOrigin(request);
        sessions.logout(refreshToken);
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE,
                ResponseCookie.from("refresh_token", "").httpOnly(true).secure(request.isSecure())
                        .sameSite("Lax").path("/api/public/auth").maxAge(Duration.ZERO).build().toString()).build();
    }

    @GetMapping("/app/me")
    UserResponse me(@AuthenticationPrincipal Jwt jwt) {
        return users.findById(CurrentUser.id(jwt)).map(UserResponseMapper::from)
                .orElseThrow(() -> new InvalidCredentialsException("Tài khoản không tồn tại"));
    }

    @GetMapping("/public/auth/session/active")
    ResponseEntity<Void> activeSession(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) throw new InvalidCredentialsException("Phiên đăng nhập không hợp lệ");
        return ResponseEntity.noContent().header(HttpHeaders.CACHE_CONTROL, "no-store").build();
    }

    private ResponseEntity<AccessTokenResponse> tokenResponse(LoginUseCase.AuthTokens tokens, HttpServletRequest request) {
        var maxAge = Duration.between(Instant.now(), tokens.refreshExpiresAt());
        var cookie = ResponseCookie.from("refresh_token", tokens.refreshToken())
                .httpOnly(true).secure(request.isSecure()).sameSite("Lax")
                .path("/api/public/auth").maxAge(maxAge.isNegative() ? Duration.ZERO : maxAge).build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(new AccessTokenResponse(tokens.accessToken(), tokens.expiresAt()));
    }

    private void requireOrigin(HttpServletRequest request) {
        var origin = request.getHeader(HttpHeaders.ORIGIN);
        if (origin != null && !origin.equals(allowedOrigin)) {
            throw new ForbiddenOriginException();
        }
    }

}
