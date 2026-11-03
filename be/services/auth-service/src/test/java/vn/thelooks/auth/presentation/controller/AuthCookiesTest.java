package vn.thelooks.auth.presentation.controller;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import vn.thelooks.auth.application.port.in.LoginUseCase;

class AuthCookiesTest {

    @Test
    void accessAndRefreshCookiesAreHttpOnlyAndScoped() {
        var now = Instant.now();
        var tokens = new LoginUseCase.AuthTokens("access-value", now.plusSeconds(1800),
                "refresh-value", now.plusSeconds(604800));
        var request = new MockHttpServletRequest();

        var access = AuthCookies.access(tokens, request).toString();
        var refresh = AuthCookies.refresh(tokens, request).toString();

        assertTrue(access.contains("HttpOnly"));
        assertTrue(access.contains("SameSite=Lax"));
        assertTrue(access.contains("Path=/api"));
        assertTrue(refresh.contains("HttpOnly"));
        assertTrue(refresh.contains("Path=/api/public/auth"));
    }

    @Test
    void accessAndRefreshCookiesAreSecureBehindHttpsProxy() {
        var now = Instant.now();
        var tokens = new LoginUseCase.AuthTokens("access-value", now.plusSeconds(1800),
                "refresh-value", now.plusSeconds(604800));
        var request = new MockHttpServletRequest();
        request.setSecure(true);

        assertTrue(AuthCookies.access(tokens, request).toString().contains("Secure"));
        assertTrue(AuthCookies.refresh(tokens, request).toString().contains("Secure"));
    }
}
