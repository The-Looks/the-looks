package vn.thelooks.observability;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class ObservabilityConfigurationTest {

    final CorrelationIdFilter filter = new CorrelationIdFilter();

    String run(String incomingHeader) throws Exception {
        var request = new MockHttpServletRequest();
        if (incomingHeader != null) {
            request.addHeader(CorrelationIdFilter.HEADER, incomingHeader);
        }
        var response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        return response.getHeader(CorrelationIdFilter.HEADER);
    }

    @Test
    void generatesIdWhenMissing() throws Exception {
        assertThat(run(null)).hasSize(36);
    }

    @Test
    void reusesValidIncomingId() throws Exception {
        assertThat(run("abc-123")).isEqualTo("abc-123");
    }

    @Test
    void replacesUnsafeIncomingId() throws Exception {
        assertThat(run("evil\nINFO fake log line")).isNotEqualTo("evil\nINFO fake log line").hasSize(36);
    }
}
