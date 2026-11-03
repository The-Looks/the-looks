package vn.thelooks.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class CookieAuthenticationTest {

    @Test
    void resolvesAccessCookieOnlyForProtectedApi() {
        var resolver = new CookieBearerTokenResolver();
        var request = new MockHttpServletRequest("GET", "/api/app/me");
        request.setCookies(new Cookie("access_token", "cookie-jwt"));
        assertEquals("cookie-jwt", resolver.resolve(request));
        request.setRequestURI("/api/public/auth/refresh");
        assertNull(resolver.resolve(request));
        request.setRequestURI("/api/admin/users");
        request.addHeader("Authorization", "Bearer header-jwt");
        assertEquals("header-jwt", resolver.resolve(request));
    }

    @Test
    void rejectsForeignOriginOnCookieAuthenticatedWrites() throws Exception {
        var filter = new CookieOriginFilter("http://localhost:5173");
        var request = new MockHttpServletRequest("POST", "/api/app/outfits");
        request.setCookies(new Cookie("access_token", "cookie-jwt"));
        request.addHeader("Origin", "https://untrusted.example");
        var response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        assertEquals(403, response.getStatus());
    }

    @Test
    void allowsConfiguredOriginOnCookieAuthenticatedWrites() throws Exception {
        var filter = new CookieOriginFilter("http://localhost:5173");
        var request = new MockHttpServletRequest("POST", "/api/app/outfits");
        request.setCookies(new Cookie("access_token", "cookie-jwt"));
        request.addHeader("Origin", "http://localhost:5173");
        var response = new MockHttpServletResponse();
        var chain = new MockFilterChain();
        filter.doFilter(request, response, chain);
        assertEquals(200, response.getStatus());
        assertEquals(request, chain.getRequest());
    }
}
