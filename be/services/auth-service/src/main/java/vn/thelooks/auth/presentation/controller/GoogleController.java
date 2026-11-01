package vn.thelooks.auth.presentation.controller;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import java.time.Instant;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.auth.application.port.in.GoogleLoginUseCase;
import vn.thelooks.auth.domain.exception.InvalidCredentialsException;

@RestController
@RequestMapping("/api/public/auth/google")
class GoogleController {

    private final GoogleLoginUseCase google;

    GoogleController(GoogleLoginUseCase google) {
        this.google = google;
    }

    @GetMapping("/start")
    ResponseEntity<Void> start(HttpServletRequest request) {
        var start = google.start();
        var stateCookie = ResponseCookie.from("google_oauth_state", start.state())
                .httpOnly(true).secure(request.isSecure()).sameSite("Lax")
                .path("/api/public/auth/google/callback").maxAge(Duration.ofMinutes(10)).build();
        return ResponseEntity.status(HttpStatus.FOUND).location(start.authorizationUri())
                .header(HttpHeaders.SET_COOKIE, stateCookie.toString())
                .header(HttpHeaders.CACHE_CONTROL, "no-store").build();
    }

    @GetMapping("/callback")
    ResponseEntity<Void> callback(@RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @CookieValue(name = "google_oauth_state", required = false) String stateCookie,
            HttpServletRequest request) {
        try {
            var tokens = google.complete(code, state, stateCookie);
            var age = Duration.between(Instant.now(), tokens.refreshExpiresAt());
            var refreshCookie = ResponseCookie.from("refresh_token", tokens.refreshToken())
                    .httpOnly(true).secure(request.isSecure()).sameSite("Lax")
                    .path("/api/public/auth").maxAge(age.isNegative() ? Duration.ZERO : age).build();
            return ResponseEntity.status(HttpStatus.FOUND).header(HttpHeaders.LOCATION, "/auth/callback")
                    .header(HttpHeaders.SET_COOKIE, clearState(request).toString())
                    .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                    .header(HttpHeaders.CACHE_CONTROL, "no-store").build();
        } catch (InvalidCredentialsException e) {
            return ResponseEntity.status(HttpStatus.FOUND).header(HttpHeaders.LOCATION, "/login?google=failed")
                    .header(HttpHeaders.SET_COOKIE, clearState(request).toString())
                    .header(HttpHeaders.CACHE_CONTROL, "no-store").build();
        }
    }

    private ResponseCookie clearState(HttpServletRequest request) {
        return ResponseCookie.from("google_oauth_state", "")
                .httpOnly(true).secure(request.isSecure()).sameSite("Lax")
                .path("/api/public/auth/google/callback").maxAge(Duration.ZERO).build();
    }

    @ExceptionHandler(IllegalStateException.class)
    ProblemDetail unavailable(IllegalStateException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE, "Google đăng nhập chưa cấu hình");
    }
}
