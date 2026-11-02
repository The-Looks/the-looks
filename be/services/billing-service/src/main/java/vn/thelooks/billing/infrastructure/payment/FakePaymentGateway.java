package vn.thelooks.billing.infrastructure.payment;

import java.util.Map;
import java.util.Optional;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import vn.thelooks.billing.application.port.out.PaymentGateway;
import vn.thelooks.billing.domain.model.Order;

/**
 * Thanh toán giả cho máy dev: hiện một mã QR mẫu, và lần hỏi trạng thái đầu tiên coi như đã trả.
 * KHÔNG bật ở production (PAYMENT_GATEWAY=sepay).
 */
@Component
@ConditionalOnProperty(name = "thelooks.billing.gateway", havingValue = "fake")
class FakePaymentGateway implements PaymentGateway {

    @Override
    public String createCheckoutUrl(Order order) {
        return "https://qr.sepay.vn/img?acc=0000000000&bank=VCB&amount=" + order.amountVnd()
                + "&des=" + SePayGateway.CODE_PREFIX + order.orderCode();
    }

    @Override
    public boolean isPaid(long orderCode, long amountVnd) {
        return true;
    }

    @Override
    public boolean isAuthentic(String authorization) {
        return false;
    }

    @Override
    public Optional<PaidNotice> parseWebhook(Map<String, Object> body) {
        return Optional.empty();
    }
}
