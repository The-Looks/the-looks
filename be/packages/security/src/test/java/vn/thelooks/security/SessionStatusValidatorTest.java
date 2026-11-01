package vn.thelooks.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

class SessionStatusValidatorTest {

    @Test
    void rejectsAnIssuedTokenAsSoonAsIdentityRevokesItsSession() throws Exception {
        var status = new AtomicInteger(204);
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/session/active", exchange -> {
            assertTrue(exchange.getRequestHeaders().getFirst("Authorization").startsWith("Bearer "));
            exchange.sendResponseHeaders(status.get(), -1);
            exchange.close();
        });
        server.start();
        try {
            var validator = new SessionStatusValidator("http://127.0.0.1:" + server.getAddress().getPort()
                    + "/session/active");
            var jwt = Jwt.withTokenValue("signed.jwt").header("alg", "RS256")
                    .claim("sid", "session-id").build();
            assertFalse(validator.validate(jwt).hasErrors());
            status.set(401);
            assertTrue(validator.validate(jwt).hasErrors());
        } finally {
            server.stop(0);
        }
    }
}
