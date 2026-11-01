package vn.thelooks.billing.infrastructure.payment;

import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import vn.thelooks.billing.application.port.out.PaymentGateway;
import vn.thelooks.billing.domain.model.Order;

/**
 * Thanh toán giả cho máy dev và demo: link thanh toán đưa thẳng về trang kết quả, và mọi đơn coi như đã trả.
 * KHÔNG bật ở production (PAYMENT_GATEWAY=payos).
 */
@Component
@ConditionalOnProperty(name = "thelooks.billing.gateway", havingValue = "fake", matchIfMissing = true)
class FakePaymentGateway implements PaymentGateway {

    private final String returnUrl;

    FakePaymentGateway(@Value("${thelooks.billing.return-url}") String returnUrl) {
        this.returnUrl = returnUrl;
    }

    @Override
    public String createCheckoutUrl(Order order) {
        return returnUrl + "?orderCode=" + order.orderCode() + "&status=PAID&fake=1";
    }

    @Override
    public boolean isPaid(long orderCode, long amountVnd) {
        return true;
    }

    @Override
    public Optional<PaidNotice> verifyWebhook(Map<String, Object> body) {
        return Optional.empty();
    }
}
