package vn.thelooks.billing.infrastructure.payment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.thelooks.billing.application.port.out.PaymentGatewayException;
import vn.thelooks.billing.domain.model.BillingPeriod;
import vn.thelooks.billing.domain.model.Order;
import vn.thelooks.billing.domain.model.OrderStatus;
import vn.thelooks.billing.domain.model.Plan;

class PayOsGatewayTest {

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
