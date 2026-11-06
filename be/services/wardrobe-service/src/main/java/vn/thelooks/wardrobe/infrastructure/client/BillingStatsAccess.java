package vn.thelooks.wardrobe.infrastructure.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.Set;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import vn.thelooks.wardrobe.application.port.out.StatsAccessUnavailableException;
import vn.thelooks.wardrobe.application.port.out.WardrobeStatsAccess;
import vn.thelooks.wardrobe.application.port.out.WardrobeStatsAccessDeniedException;

@Component
class BillingStatsAccess implements WardrobeStatsAccess {
    @JsonIgnoreProperties(ignoreUnknown = true)
    record Entitlements(Set<String> features) {}
    private final RestClient billing;
    BillingStatsAccess(@Qualifier("billingRestClient") RestClient billing) { this.billing = billing; }
    public void requireAccess() {
        try {
            var me = billing.get().uri("/api/app/billing/me").retrieve().body(Entitlements.class);
            if (me == null || me.features() == null) throw new StatsAccessUnavailableException(null);
            if (!me.features().contains("WARDROBE_STATS")) throw new WardrobeStatsAccessDeniedException();
        } catch (RestClientException e) { throw new StatsAccessUnavailableException(e); }
    }
}
