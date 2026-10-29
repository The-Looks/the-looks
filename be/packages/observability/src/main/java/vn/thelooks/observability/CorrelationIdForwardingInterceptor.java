package vn.thelooks.observability;

import java.io.IOException;
import org.slf4j.MDC;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;

/** Gắn vào RestClient gọi service khác để correlation ID đi tiếp sang service đó. */
public class CorrelationIdForwardingInterceptor implements ClientHttpRequestInterceptor {

    @Override
    public ClientHttpResponse intercept(HttpRequest request, byte[] body, ClientHttpRequestExecution execution)
            throws IOException {
        String id = MDC.get(CorrelationIdFilter.MDC_KEY);
        if (id != null && request.getHeaders().getFirst(CorrelationIdFilter.HEADER) == null) {
            request.getHeaders().set(CorrelationIdFilter.HEADER, id);
        }
        return execution.execute(request, body);
    }
}
