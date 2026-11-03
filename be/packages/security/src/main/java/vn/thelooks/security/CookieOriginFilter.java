package vn.thelooks.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpHeaders;
import org.springframework.web.filter.OncePerRequestFilter;

/** Browser cookies are automatic credentials, so writes must come from the configured web origin. */
final class CookieOriginFilter extends OncePerRequestFilter {

    private final String allowedOrigin;

    CookieOriginFilter(String allowedOrigin) {
        this.allowedOrigin = allowedOrigin;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        var path = request.getRequestURI();
        var method = request.getMethod();
        var protectedPath = path.startsWith("/api/app/") || path.startsWith("/api/admin/");
        var unsafe = !method.equals("GET") && !method.equals("HEAD") && !method.equals("OPTIONS");
        if (protectedPath && unsafe && hasAccessCookie(request) && !hasBearerHeader(request)
                && !allowedOrigin.equals(request.getHeader(HttpHeaders.ORIGIN))) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Nguồn yêu cầu không được phép");
            return;
        }
        chain.doFilter(request, response);
    }

    private static boolean hasAccessCookie(HttpServletRequest request) {
        var cookies = request.getCookies();
        if (cookies == null) return false;
        for (Cookie cookie : cookies) {
            if ("access_token".equals(cookie.getName()) && !cookie.getValue().isBlank()) return true;
        }
        return false;
    }

    private static boolean hasBearerHeader(HttpServletRequest request) {
        var header = request.getHeader(HttpHeaders.AUTHORIZATION);
        return header != null && header.startsWith("Bearer ");
    }
}
