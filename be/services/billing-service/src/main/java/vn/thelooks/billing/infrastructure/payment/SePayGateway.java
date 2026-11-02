package vn.thelooks.billing.infrastructure.payment;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import vn.thelooks.billing.application.port.out.PaymentGateway;
import vn.thelooks.billing.domain.model.Order;

/**
 * SePay: người dùng quét VietQR chuyển khoản vào tài khoản ngân hàng của nhóm, nội dung {@code TLK<mã đơn>}.
 * SePay thấy tiền vào thì gọi webhook (xác thực bằng header {@code Authorization: Apikey <key>}).
 * Tài liệu: https://docs.sepay.vn/tich-hop-webhooks.html
 */
@Component
@ConditionalOnProperty(name = "thelooks.billing.gateway", havingValue = "sepay")
class SePayGateway implements PaymentGateway {

    static final String CODE_PREFIX = "TLK";
    private static final Pattern ORDER_CODE = Pattern.compile(CODE_PREFIX + "(\\d{1,18})", Pattern.CASE_INSENSITIVE);

    private final String accountNumber;
    private final String bank;
    private final byte[] expectedAuthorization;

    SePayGateway(@Value("${thelooks.billing.sepay.account-number}") String accountNumber,
            @Value("${thelooks.billing.sepay.bank}") String bank,
            @Value("${thelooks.billing.sepay.webhook-api-key}") String webhookApiKey) {
        if (accountNumber.isBlank() || bank.isBlank() || webhookApiKey.isBlank()) {
            throw new IllegalStateException("Thiếu SEPAY_ACCOUNT_NUMBER, SEPAY_BANK hoặc SEPAY_WEBHOOK_API_KEY");
        }
        this.accountNumber = accountNumber;
        this.bank = bank;
        this.expectedAuthorization = ("Apikey " + webhookApiKey).getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public String createCheckoutUrl(Order order) {
        return "https://qr.sepay.vn/img?acc=" + encode(accountNumber) + "&bank=" + encode(bank)
                + "&amount=" + order.amountVnd() + "&des=" + CODE_PREFIX + order.orderCode();
    }

    @Override
    public boolean isPaid(long orderCode, long amountVnd) {
        return false;
    }

    @Override
    public boolean isAuthentic(String authorization) {
        return authorization != null
                && MessageDigest.isEqual(expectedAuthorization, authorization.trim().getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public Optional<PaidNotice> parseWebhook(Map<String, Object> body) {
        if (!"in".equals(body.get("transferType")) || !(body.get("transferAmount") instanceof Number amount)) {
            return Optional.empty();
        }
        // Ngân hàng có thể chèn thêm chữ vào nội dung, nên tìm mã ở bất kỳ đâu
        var match = ORDER_CODE.matcher(String.valueOf(body.get("content")));
        return match.find()
                ? Optional.of(new PaidNotice(Long.parseLong(match.group(1)), amount.longValue()))
                : Optional.empty();
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
