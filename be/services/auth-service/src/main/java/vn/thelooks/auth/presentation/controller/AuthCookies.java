package vn.thelooks.auth.presentation.controller;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import java.time.Instant;
import org.springframework.http.ResponseCookie;
import vn.thelooks.auth.application.port.in.LoginUseCase;

/** Cookie policy shared by password login, refresh and Google callback. */
final class AuthCookies {

    private AuthCookies() {
    }

    static ResponseCookie access(LoginUseCase.AuthTokens tokens, HttpServletRequest request) {
        return cookie("access_token", tokens.accessToken(), "/api", tokens.expiresAt(), request);
    }

    static ResponseCookie refresh(LoginUseCase.AuthTokens tokens, HttpServletRequest request) {
        return cookie("refresh_token", tokens.refreshToken(), "/api/public/auth", tokens.refreshExpiresAt(), request);
    }

    static ResponseCookie clearAccess(HttpServletRequest request) {
        return clear("access_token", "/api", request);
    }

    static ResponseCookie clearRefresh(HttpServletRequest request) {
        return clear("refresh_token", "/api/public/auth", request);
    }

    private static ResponseCookie cookie(String name, String value, String path, Instant expiresAt,
            HttpServletRequest request) {
        var remaining = Duration.between(Instant.now(), expiresAt);
        return ResponseCookie.from(name, value)
                .httpOnly(true).secure(request.isSecure()).sameSite("Lax")
                .path(path).maxAge(remaining.isNegative() ? Duration.ZERO : remaining).build();
    }

    private static ResponseCookie clear(String name, String path, HttpServletRequest request) {
        return ResponseCookie.from(name, "").httpOnly(true).secure(request.isSecure())
                .sameSite("Lax").path(path).maxAge(Duration.ZERO).build();
    }
}
