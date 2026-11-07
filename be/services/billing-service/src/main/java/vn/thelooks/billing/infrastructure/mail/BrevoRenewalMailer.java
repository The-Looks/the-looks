package vn.thelooks.billing.infrastructure.mail;

import java.text.NumberFormat;
import java.time.Duration;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import vn.thelooks.billing.application.port.out.RenewalMailer;
import vn.thelooks.billing.application.port.out.RenewalReminderRepository.Due;
import vn.thelooks.billing.domain.model.BillingPeriod;

/**
 * Gửi qua API HTTPS của Brevo (gói free 300 email/ngày). Không dùng SMTP vì Render free chặn cổng 25/465/587.
 * Chưa có BREVO_API_KEY hoặc MAIL_FROM thì tắt.
 */
@Component
class BrevoRenewalMailer implements RenewalMailer {

    private static final ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final RestClient brevo;
    private final String apiKey;
    private final String from;
    private final String renewUrl;

    BrevoRenewalMailer(@Value("${thelooks.mail.brevo-url:https://api.brevo.com}") String brevoUrl,
            @Value("${thelooks.mail.brevo-api-key:}") String apiKey,
            @Value("${thelooks.mail.from:}") String from,
            @Value("${thelooks.billing.renew-url}") String renewUrl) {
        var requests = new SimpleClientHttpRequestFactory();
        requests.setConnectTimeout(Duration.ofSeconds(5));
        requests.setReadTimeout(Duration.ofSeconds(10));
        this.brevo = RestClient.builder().baseUrl(brevoUrl).requestFactory(requests).build();
        this.apiKey = apiKey;
        this.from = from;
        this.renewUrl = renewUrl;
    }

    @Override
    public boolean enabled() {
        return !apiKey.isBlank() && !from.isBlank();
    }

    @Override
    public void send(Due due) {
        brevo.post().uri("/v3/smtp/email")
                .header("api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload(due))
                .retrieve()
                .toBodilessEntity();
    }

    Map<String, Object> payload(Due due) {
        String plan = due.plan().displayName();
        String date = DATE.format(due.expiresAt().atZone(VIETNAM));
        String price = NumberFormat.getIntegerInstance(Locale.forLanguageTag("vi-VN")).format(due.plan().priceVnd(due.period()));
        String period = due.period() == BillingPeriod.MONTHLY ? "tháng" : "năm";
        String html = """
                <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1f1f1f">
                  <h2 style="color:#7c3aed">THE LOOKS</h2>
                  <p>Xin chào,</p>
                  <p>Gói <b>%s</b> của bạn sẽ hết hạn vào ngày <b>%s</b>.</p>
                  <p>Gia hạn ngay để tiếp tục dùng đầy đủ tính năng (%sđ/%s). Sau ngày hết hạn bạn vẫn còn 3 ngày
                     để gia hạn mà không mất quyền lợi.</p>
                  <p><a href="%s" style="display:inline-block;background:#7c3aed;color:#fff;padding:10px 18px;
                     border-radius:999px;text-decoration:none">Gia hạn gói %s</a></p>
                  <p style="color:#666;font-size:13px">Không muốn gia hạn? Tắt "Tự gia hạn" trong trang Gói của tôi,
                     gói sẽ về Free khi hết hạn và dữ liệu của bạn vẫn được giữ.</p>
                </div>
                """.formatted(plan, date, price, period, renewUrl, plan);
        return Map.of(
                "sender", Map.of("name", "THE LOOKS", "email", from),
                "to", List.of(Map.of("email", due.email())),
                "subject", "Gói " + plan + " của bạn sẽ hết hạn ngày " + date,
                "htmlContent", html);
    }
}
