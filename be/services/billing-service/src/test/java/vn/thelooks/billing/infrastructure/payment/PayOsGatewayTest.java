package vn.thelooks.billing.infrastructure.payment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicBoolean;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;
import vn.thelooks.billing.application.port.out.PaymentGatewayException;
import vn.thelooks.billing.domain.model.BillingPeriod;
import vn.thelooks.billing.domain.model.Order;
import vn.thelooks.billing.domain.model.OrderStatus;
import vn.thelooks.billing.domain.model.Plan;

class PayOsGatewayTest {

    @Test
    void accountDeletionCancelsOnlyAnUnpaidLinkConfirmedByPayOs() throws Exception {
        AtomicBoolean cancelled = new AtomicBoolean();
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/v2/payment-requests/100001", exchange -> {
            boolean cancel = exchange.getRequestURI().getPath().endsWith("/cancel");
            if (cancel) cancelled.set(true);
            String status = cancelled.get() ? "CANCELLED" : "PENDING";
            byte[] body = ("{\"code\":\"00\",\"data\":{\"orderCode\":100001,\"status\":\""
                    + status + "\",\"amountPaid\":0}}").getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, body.length);
            try (var output = exchange.getResponseBody()) { output.write(body); }
        });
        server.start();
        try {
            var gateway = new PayOsGateway("http://127.0.0.1:" + server.getAddress().getPort(),
                    "client", "api-key", "checksum", "https://web/return", "https://web/cancel", Clock.systemUTC());
            assertThat(gateway.cancelUnpaid(100001L)).isTrue();
            assertThat(cancelled.get()).isTrue();
        } finally {
            server.stop(0);
        }
    }

    @Test
    void accountDeletionDoesNotCancelAPaidLink() throws Exception {
        AtomicBoolean cancelCalled = new AtomicBoolean();
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/v2/payment-requests/100002", exchange -> {
            if (exchange.getRequestURI().getPath().endsWith("/cancel")) cancelCalled.set(true);
            byte[] body = "{\"code\":\"00\",\"data\":{\"orderCode\":100002,\"status\":\"PAID\",\"amountPaid\":49000}}"
                    .getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, body.length);
            try (var output = exchange.getResponseBody()) { output.write(body); }
        });
        server.start();
        try {
            var gateway = new PayOsGateway("http://127.0.0.1:" + server.getAddress().getPort(),
                    "client", "api-key", "checksum", "https://web/return", "https://web/cancel", Clock.systemUTC());
            assertThat(gateway.cancelUnpaid(100002L)).isFalse();
            assertThat(cancelCalled.get()).isFalse();
        } finally {
            server.stop(0);
        }
    }

    @Test
    void withoutKeysTheServiceStartsButNothingCanBeSoldOrActivated() {
        var gateway = new PayOsGateway("http://127.0.0.1:1", "", "", "", "https://web/billing/result", "https://web/plans",
                Clock.systemUTC());
        var order = new Order(100001L, UUID.randomUUID(), Plan.PLUS, BillingPeriod.MONTHLY, 49_000, OrderStatus.PENDING,
                null, Instant.now(), null);

        assertThatThrownBy(() -> gateway.createCheckoutUrl(order)).isInstanceOf(PaymentGatewayException.class);
        assertThat(gateway.isPaid(100001L, 49_000)).isFalse();
        assertThat(gateway.verifyWebhook(Map.of("data", Map.of("code", "00", "orderCode", 100001, "amount", 49_000),
                "signature", "x"))).isEmpty();
    }
}
