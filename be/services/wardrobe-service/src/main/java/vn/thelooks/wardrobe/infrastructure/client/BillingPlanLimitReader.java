package vn.thelooks.wardrobe.infrastructure.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import vn.thelooks.wardrobe.application.port.out.PlanLimitReader;

/** Gọi billing-service GET /api/app/billing/me (JWT chuyển tiếp). Lỗi → giới hạn gói Free. */
@Component
class BillingPlanLimitReader implements PlanLimitReader {

    static final int FREE_ITEMS = 50;
    private static final Logger log = LoggerFactory.getLogger(BillingPlanLimitReader.class);

    private final RestClient billing;

    BillingPlanLimitReader(@org.springframework.beans.factory.annotation.Qualifier("billingRestClient") RestClient billingRestClient) {
        this.billing = billingRestClient;
    }

    @Override
    public Integer maxWardrobeItems() {
        try {
            Entitlements me = billing.get().uri("/api/app/billing/me").retrieve().body(Entitlements.class);
            return me == null || me.limits() == null ? FREE_ITEMS : me.limits().wardrobeItems();
        } catch (RestClientException e) {
            log.warn("Không hỏi được billing-service, dùng giới hạn gói Free: {}", e.getMessage());
            return FREE_ITEMS;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Entitlements(Limits limits) {
    }

    /** wardrobeItems null = không giới hạn (gói Pro). */
    @JsonIgnoreProperties(ignoreUnknown = true)
    record Limits(Integer wardrobeItems) {
    }
}
