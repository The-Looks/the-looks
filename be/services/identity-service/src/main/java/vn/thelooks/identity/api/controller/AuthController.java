package vn.thelooks.identity.api.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.identity.application.port.out.UserRepository;
import vn.thelooks.identity.application.usecase.LoginUseCase;
import vn.thelooks.identity.application.usecase.RegisterUseCase;
import vn.thelooks.identity.application.usecase.SessionUseCase;
import vn.thelooks.identity.domain.exception.InvalidCredentialsException;
import vn.thelooks.identity.domain.exception.UserAlreadyExistsException;
import vn.thelooks.identity.domain.model.Role;
import vn.thelooks.identity.domain.model.User;
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
        return ResponseEntity.status(HttpStatus.CREATED).body(UserResponse.from(user));
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
        return users.findById(CurrentUser.id(jwt)).map(UserResponse::from)
                .orElseThrow(() -> new InvalidCredentialsException("Tài khoản không tồn tại"));
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

    record RegisterRequest(@NotBlank @Email String email, @NotBlank @Size(min = 8) String password,
            @NotBlank @Size(max = 60) String username) {
    }

    record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {
    }

    record AccessTokenResponse(String accessToken, Instant expiresAt) {
    }

    record UserResponse(UUID id, String email, String username, Role role, Instant createdAt) {

        static UserResponse from(User user) {
            return new UserResponse(user.id(), user.email(), user.username(), user.role(), user.createdAt());
        }
    }

    private static class ForbiddenOriginException extends RuntimeException {
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    ProblemDetail unauthorized(InvalidCredentialsException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, e.getMessage());
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    ProblemDetail conflict(UserAlreadyExistsException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, e.getMessage());
    }

    @ExceptionHandler(ForbiddenOriginException.class)
    ProblemDetail forbidden(ForbiddenOriginException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Nguồn yêu cầu không được phép");
    }
}
