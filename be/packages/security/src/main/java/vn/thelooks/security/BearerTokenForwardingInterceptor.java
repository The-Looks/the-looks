package vn.thelooks.security;

import java.io.IOException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

/**
 * Gắn vào RestClient gọi service khác: chuyển tiếp JWT của người dùng hiện tại,
 * để service được gọi tự biết "của ai" và tự kiểm tra quyền.
 */
public class BearerTokenForwardingInterceptor implements ClientHttpRequestInterceptor {

    @Override
    public ClientHttpResponse intercept(HttpRequest request, byte[] body, ClientHttpRequestExecution execution)
            throws IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwt && request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION) == null) {
            request.getHeaders().setBearerAuth(jwt.getToken().getTokenValue());
        }
        return execution.execute(request, body);
    }
}
