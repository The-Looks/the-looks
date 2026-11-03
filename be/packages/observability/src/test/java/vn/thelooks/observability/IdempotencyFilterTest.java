package vn.thelooks.observability;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class IdempotencyFilterTest {

    final IdempotencyFilter filter = new IdempotencyFilter();
    final AtomicInteger runs = new AtomicInteger();
    int status = 201;

    MockHttpServletResponse send(String method, String key, String token) throws Exception {
        return send(method, key, token, null);
    }

    MockHttpServletResponse send(String method, String key, String token, String accessCookie) throws Exception {
        var request = new MockHttpServletRequest(method, "/api/app/outfits");
        if (key != null) request.addHeader(IdempotencyFilter.HEADER, key);
        if (token != null) request.addHeader("Authorization", "Bearer " + token);
        if (accessCookie != null) request.setCookies(new Cookie("access_token", accessCookie));
        var response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain(new jakarta.servlet.http.HttpServlet() {
            @Override
            protected void service(jakarta.servlet.http.HttpServletRequest req, HttpServletResponse res)
                    throws java.io.IOException {
                res.setStatus(status);
                res.setContentType("application/json");
                res.getWriter().write("{\"run\":" + runs.incrementAndGet() + "}");
            }
        }));
        return response;
    }

    @Test
    void sameKeyRunsOnceAndReplaysTheFirstResponse() throws Exception {
        var first = send("POST", "key-12345678", "alice");
        var again = send("POST", "key-12345678", "alice");
        assertThat(runs).hasValue(1);
        assertThat(again.getStatus()).isEqualTo(201);
        assertThat(again.getContentAsString()).isEqualTo(first.getContentAsString()).isEqualTo("{\"run\":1}");
        assertThat(again.getHeader(IdempotencyFilter.REPLAYED_HEADER)).isEqualTo("true");
    }

    @Test
    void keyIsScopedToTheCaller() throws Exception {
        send("POST", "key-12345678", "alice");
        assertThat(send("POST", "key-12345678", "bob").getContentAsString()).isEqualTo("{\"run\":2}");
    }

    @Test
    void keyIsScopedToTheAccessCookieForBrowserRequests() throws Exception {
        send("POST", "key-12345678", null, "alice-cookie");
        assertThat(send("POST", "key-12345678", null, "bob-cookie").getContentAsString())
                .isEqualTo("{\"run\":2}");
        assertThat(send("POST", "key-12345678", null, "alice-cookie").getContentAsString())
                .isEqualTo("{\"run\":1}");
        assertThat(runs).hasValue(2);
    }

    @Test
    void withoutKeyOrForReadsEveryRequestRuns() throws Exception {
        send("POST", null, "alice");
        send("POST", null, "alice");
        send("GET", "key-12345678", "alice");
        send("GET", "key-12345678", "alice");
        assertThat(runs).hasValue(4);
    }

    @Test
    void serverErrorsAreNotRemembered() throws Exception {
        status = 503;
        send("POST", "key-12345678", "alice");
        status = 201;
        assertThat(send("POST", "key-12345678", "alice").getStatus()).isEqualTo(201);
        assertThat(runs).hasValue(2);
    }

    @Test
    void rejectsMalformedKey() throws Exception {
        assertThat(send("POST", "bad key\n", "alice").getStatus()).isEqualTo(400);
        assertThat(runs).hasValue(0);
    }
}
