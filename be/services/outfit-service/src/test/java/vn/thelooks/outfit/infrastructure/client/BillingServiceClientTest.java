package vn.thelooks.outfit.infrastructure.client;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import vn.thelooks.outfit.application.port.out.PlanLimitReader;

class BillingServiceClientTest {

    final RestClient.Builder builder = RestClient.builder().baseUrl("http://billing");
    final MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
    final BillingServiceClient client = new BillingServiceClient(builder.build());

    @Test
    void readsDailyAiLimitOfThePlan() {
        server.expect(requestTo("http://billing/api/app/billing/me")).andRespond(withSuccess(
                "{\"plan\":\"PLUS\",\"limits\":{\"wardrobeItems\":300,\"aiSuggestionsPerDay\":20},\"features\":[]}",
                MediaType.APPLICATION_JSON));
        assertThat(client.aiSuggestionsPerDay()).isEqualTo(20);
    }

    @Test
    void fallsBackToFreeLimitWhenBillingFails() {
        server.expect(requestTo("http://billing/api/app/billing/me")).andRespond(withServerError());
        assertThat(client.aiSuggestionsPerDay()).isEqualTo(PlanLimitReader.FREE_AI_PER_DAY);
    }
}
