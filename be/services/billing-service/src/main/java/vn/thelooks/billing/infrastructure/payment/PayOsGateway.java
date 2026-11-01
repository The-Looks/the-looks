package vn.thelooks.billing.infrastructure.payment;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.Clock;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import vn.thelooks.billing.application.port.out.PaymentGateway;
import vn.thelooks.billing.application.port.out.PaymentGatewayException;
import vn.thelooks.billing.domain.model.Order;

/**
 * PayOS (payos.vn): người dùng quét VietQR bằng app ngân hàng hoặc MoMo, tiền về tài khoản ngân hàng của nhóm.
 * Cần PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY lấy trong trang quản lý PayOS.
 */
@Component
@ConditionalOnProperty(name = "thelooks.billing.gateway", havingValue = "payos")
class PayOsGateway implements PaymentGateway {

    private static final Logger log = LoggerFactory.getLogger(PayOsGateway.class);
    /** Link thanh toán hết hạn sau 15 phút. */
    static final Duration LINK_TTL = Duration.ofMinutes(15);

    private final RestClient http;
    private final String checksumKey;
    private final String returnUrl;
    private final String cancelUrl;
    private final Clock clock;

    PayOsGateway(
            @Value("${thelooks.billing.payos.url:https://api-merchant.payos.vn}") String url,
            @Value("${thelooks.billing.payos.client-id}") String clientId,
            @Value("${thelooks.billing.payos.api-key}") String apiKey,
            @Value("${thelooks.billing.payos.checksum-key}") String checksumKey,
            @Value("${thelooks.billing.return-url}") String returnUrl,
            @Value("${thelooks.billing.cancel-url}") String cancelUrl,
            Clock clock) {
        if (clientId.isBlank() || apiKey.isBlank() || checksumKey.isBlank()) {
            throw new IllegalStateException("Thiếu PAYOS_CLIENT_ID / PAYOS_API_KEY / PAYOS_CHECKSUM_KEY");
        }
        var requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(3));
        requestFactory.setReadTimeout(Duration.ofSeconds(10));
        this.http = RestClient.builder()
                .baseUrl(url)
                .requestFactory(requestFactory)
                .defaultHeader("x-client-id", clientId)
                .defaultHeader("x-api-key", apiKey)
                .build();
        this.checksumKey = checksumKey;
        this.returnUrl = returnUrl;
        this.cancelUrl = cancelUrl;
        this.clock = clock;
    }

    @Override
    public String createCheckoutUrl(Order order) {
        // Ngân hàng không liên kết PayOS chỉ nhận nội dung tối đa 9 ký tự
        String description = "TL" + order.orderCode();
        Map<String, Object> signed = Map.of(
                "amount", order.amountVnd(),
                "cancelUrl", cancelUrl,
                "description", description,
                "orderCode", order.orderCode(),
                "returnUrl", returnUrl);
        Map<String, Object> body = new LinkedHashMap<>(signed);
        body.put("expiredAt", clock.instant().plus(LINK_TTL).getEpochSecond());
        body.put("signature", PayOsSignature.sign(signed, checksumKey));
        try {
            CreateResponse response = http.post().uri("/v2/payment-requests").body(body).retrieve().body(CreateResponse.class);
            if (response == null || !"00".equals(response.code()) || response.data() == null) {
                throw new PaymentGatewayException("PayOS từ chối tạo link: " + (response == null ? "rỗng" : response.desc()), null);
            }
            return response.data().checkoutUrl();
        } catch (RestClientException e) {
            throw new PaymentGatewayException("Không gọi được PayOS", e);
        }
    }

    @Override
    public boolean isPaid(long orderCode, long amountVnd) {
        try {
            StatusResponse response = http.get().uri("/v2/payment-requests/{orderCode}", orderCode).retrieve().body(StatusResponse.class);
            return response != null && response.data() != null
                    && "PAID".equals(response.data().status())
                    && response.data().amountPaid() >= amountVnd;
        } catch (RestClientException e) {
            log.warn("Không hỏi được trạng thái đơn {} từ PayOS: {}", orderCode, e.getMessage());
            return false; // webhook vẫn sẽ kích hoạt gói khi tới
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public Optional<PaidNotice> verifyWebhook(Map<String, Object> body) {
        if (!(body.get("data") instanceof Map<?, ?> raw)) {
            return Optional.empty();
        }
        Map<String, Object> data = (Map<String, Object>) raw;
        String signature = body.get("signature") instanceof String text ? text : null;
        if (!PayOsSignature.verify(data, signature, checksumKey)) {
            log.warn("Webhook PayOS sai chữ ký, bỏ qua");
            return Optional.empty();
        }
        if (!"00".equals(String.valueOf(data.get("code"))) || !(data.get("orderCode") instanceof Number code)
                || !(data.get("amount") instanceof Number amount)) {
            return Optional.empty();
        }
        return Optional.of(new PaidNotice(code.longValue(), amount.longValue()));
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record CreateResponse(String code, String desc, CreateData data) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record CreateData(String checkoutUrl) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record StatusResponse(String code, StatusData data) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record StatusData(String status, long amountPaid) {
    }
}
