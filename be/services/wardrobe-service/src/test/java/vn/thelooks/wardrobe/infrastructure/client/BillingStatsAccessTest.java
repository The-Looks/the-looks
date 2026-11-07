package vn.thelooks.wardrobe.infrastructure.client;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import vn.thelooks.wardrobe.application.port.out.StatsAccessUnavailableException;
import vn.thelooks.wardrobe.application.port.out.WardrobeStatsAccessDeniedException;

class BillingStatsAccessTest {
    final RestClient.Builder builder = RestClient.builder().baseUrl("http://billing");
    final MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
    final BillingStatsAccess access = new BillingStatsAccess(builder.build());
    @Test
    void requiresTheActualFeatureRatherThanTrustingThePlanLabel() {
        server.expect(requestTo("http://billing/api/app/billing/me")).andRespond(withSuccess("{\"plan\":\"PRO\",\"features\":[]}", MediaType.APPLICATION_JSON));
        assertThatThrownBy(access::requireAccess).isInstanceOf(WardrobeStatsAccessDeniedException.class);
    }
    @Test
    void acceptsTheFeatureFromBilling() {
        server.expect(requestTo("http://billing/api/app/billing/me")).andRespond(withSuccess("{\"features\":[\"WARDROBE_STATS\"]}", MediaType.APPLICATION_JSON));
        assertThatCode(access::requireAccess).doesNotThrowAnyException();
    }
    @Test
    void failsClosedWhenBillingIsUnavailable() {
        server.expect(requestTo("http://billing/api/app/billing/me")).andRespond(withServerError());
        assertThatThrownBy(access::requireAccess).isInstanceOf(StatsAccessUnavailableException.class);
    }
    @Test
    void failsClosedForMalformedEntitlements() {
        server.expect(requestTo("http://billing/api/app/billing/me")).andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));
        assertThatThrownBy(access::requireAccess).isInstanceOf(StatsAccessUnavailableException.class);
    }
    @Test
    void costFeatureIsCheckedIndependentlyOfWardrobeStats() {
        server.expect(requestTo("http://billing/api/app/billing/me")).andRespond(withSuccess("{\"features\":[\"WARDROBE_STATS\"]}", MediaType.APPLICATION_JSON));
        assertThatThrownBy(access::requireCostAccess).isInstanceOf(vn.thelooks.wardrobe.application.port.out.CostPerWearAccessDeniedException.class);
    }
    @Test
    void grantsCostAccessForTheCostFeature() {
        server.expect(requestTo("http://billing/api/app/billing/me")).andRespond(withSuccess("{\"features\":[\"COST_PER_WEAR\"]}", MediaType.APPLICATION_JSON));
        assertThatCode(access::requireCostAccess).doesNotThrowAnyException();
    }
}
