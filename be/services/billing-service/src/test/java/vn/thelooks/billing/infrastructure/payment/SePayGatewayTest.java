package vn.thelooks.billing.infrastructure.payment;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.thelooks.billing.application.port.out.PaymentGateway.PaidNotice;
import vn.thelooks.billing.domain.model.BillingPeriod;
import vn.thelooks.billing.domain.model.Order;
import vn.thelooks.billing.domain.model.OrderStatus;
import vn.thelooks.billing.domain.model.Plan;

class SePayGatewayTest {

    final SePayGateway gateway = new SePayGateway("0123456789", "MBBank", "secret-key");

    @Test
    void qrCarriesAmountAndOrderCode() {
        var order = new Order(100123L, UUID.randomUUID(), Plan.PLUS, BillingPeriod.MONTHLY, 39_000, OrderStatus.PENDING,
                null, Instant.now(), null);
        assertThat(gateway.createCheckoutUrl(order))
                .isEqualTo("https://qr.sepay.vn/img?acc=0123456789&bank=MBBank&amount=39000&des=TLK100123");
    }

    @Test
    void acceptsOnlyTheConfiguredApiKey() {
        assertThat(gateway.isAuthentic("Apikey secret-key")).isTrue();
        assertThat(gateway.isAuthentic("Apikey wrong")).isFalse();
        assertThat(gateway.isAuthentic("secret-key")).isFalse();
        assertThat(gateway.isAuthentic(null)).isFalse();
    }

    @Test
    void findsOrderCodeAnywhereInTransferContent() {
        var body = Map.<String, Object>of("transferType", "in", "transferAmount", 39000,
                "content", "MBVCB.123 NGUYEN VAN A chuyen tien TLK100123 FT2611");
        assertThat(gateway.parseWebhook(body)).contains(new PaidNotice(100123, 39000));
    }

    @Test
    void ignoresOutgoingTransfersAndUnknownContent() {
        assertThat(gateway.parseWebhook(Map.of("transferType", "out", "transferAmount", 39000, "content", "TLK100123")))
                .isEmpty();
        assertThat(gateway.parseWebhook(Map.of("transferType", "in", "transferAmount", 39000, "content", "tra no")))
                .isEmpty();
    }
}
