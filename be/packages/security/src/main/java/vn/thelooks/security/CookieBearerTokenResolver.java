package vn.thelooks.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;

/** Bearer header remains available for internal and native clients; browsers use an HttpOnly cookie. */
final class CookieBearerTokenResolver implements BearerTokenResolver {

    private final DefaultBearerTokenResolver headers = new DefaultBearerTokenResolver();

    @Override
    public String resolve(HttpServletRequest request) {
        var headerToken = headers.resolve(request);
        if (headerToken != null) return headerToken;
        var path = request.getRequestURI();
        if (!path.startsWith("/api/app/") && !path.startsWith("/api/admin/")) return null;
        var cookies = request.getCookies();
        if (cookies == null) return null;
        for (Cookie cookie : cookies) {
            if ("access_token".equals(cookie.getName()) && !cookie.getValue().isBlank()) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
