package vn.thelooks.outfit.infrastructure.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import java.util.Set;
import vn.thelooks.outfit.application.port.out.PlanCheckUnavailableException;
import vn.thelooks.outfit.application.port.out.PlanLimitReader;
import vn.thelooks.outfit.application.port.out.WearCalendarAccess;
import vn.thelooks.outfit.application.port.out.WearCalendarLockedException;

/**
 * Hỏi billing-service gói của người dùng (JWT được chuyển tiếp qua BearerTokenForwardingInterceptor).
 * billing-service lỗi hoặc chưa chạy → dùng giới hạn gói Free: người dùng vẫn có gợi ý theo thuật toán,
 * chỉ ít lượt qua AI hơn, không bị chặn hẳn.
 */
@Component
class BillingServiceClient implements PlanLimitReader, WearCalendarAccess {

    private static final Logger log = LoggerFactory.getLogger(BillingServiceClient.class);

    private final RestClient billing;

    BillingServiceClient(RestClient billingRestClient) {
        this.billing = billingRestClient;
    }

    @Override
    public int aiSuggestionsPerDay() {
        try {
            Entitlements me = billing.get().uri("/api/app/billing/me").retrieve().body(Entitlements.class);
            return me == null || me.limits() == null ? FREE_AI_PER_DAY : me.limits().aiSuggestionsPerDay();
        } catch (RestClientException e) {
            log.warn("Không hỏi được billing-service, dùng giới hạn gói Free: {}", e.getMessage());
            return FREE_AI_PER_DAY;
        }
    }

    /** Khác giới hạn AI: không hỏi được billing thì báo lỗi tạm thời, không coi là gói Free. */
    @Override
    public void requireWearCalendar() {
        Entitlements me;
        try {
            me = billing.get().uri("/api/app/billing/me").retrieve().body(Entitlements.class);
        } catch (RestClientException e) {
            throw new PlanCheckUnavailableException(e);
        }
        if (me == null || me.features() == null) throw new PlanCheckUnavailableException(null);
        if (!me.features().contains("WEAR_CALENDAR")) throw new WearCalendarLockedException();
    }

    /** Một phần schema Entitlements trong billing-api.yaml. */
    @JsonIgnoreProperties(ignoreUnknown = true)
    record Entitlements(Limits limits, Set<String> features) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Limits(int aiSuggestionsPerDay) {
    }
}
