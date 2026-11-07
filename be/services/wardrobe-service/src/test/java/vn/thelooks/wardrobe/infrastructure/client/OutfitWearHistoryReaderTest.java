package vn.thelooks.wardrobe.infrastructure.client;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import vn.thelooks.wardrobe.application.port.out.WearHistoryUnavailableException;

class OutfitWearHistoryReaderTest {
    final RestClient.Builder builder = RestClient.builder().baseUrl("http://outfit");
    final MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
    final OutfitWearHistoryReader reader = new OutfitWearHistoryReader(builder.build());
    @Test
    void readsActualWearTimesAndAcceptsEmptyHistoryForNewUsers() {
        UUID item = UUID.randomUUID();
        server.expect(requestTo("http://outfit/api/app/outfits/wear-summary")).andRespond(withSuccess(
                "[{\"itemId\":\"" + item + "\",\"wearCount\":10,\"lastWornAt\":\"2026-11-01T00:00:00Z\"}]", MediaType.APPLICATION_JSON));
        assertThat(reader.lastWornAt(UUID.randomUUID())).containsEntry(item, Instant.parse("2026-11-01T00:00:00Z"));
        server.verify();
    }
    @Test
    void doesNotTreatAnUnavailableServiceAsNeverWorn() {
        server.expect(requestTo("http://outfit/api/app/outfits/wear-summary")).andRespond(withServerError());
        assertThatThrownBy(() -> reader.lastWornAt(UUID.randomUUID())).isInstanceOf(WearHistoryUnavailableException.class);
    }
    @Test
    void emptyHistoryIsValid() {
        server.expect(requestTo("http://outfit/api/app/outfits/wear-summary")).andRespond(withSuccess("[]", MediaType.APPLICATION_JSON));
        assertThat(reader.lastWornAt(UUID.randomUUID())).isEmpty();
    }
    @Test
    void exposesActualCountsForCostCalculation() {
        UUID id = UUID.randomUUID();
        server.expect(requestTo("http://outfit/api/app/outfits/wear-summary")).andRespond(withSuccess(
                "[{\"itemId\":\"" + id + "\",\"wearCount\":10,\"lastWornAt\":\"2026-11-01T00:00:00Z\"}]", MediaType.APPLICATION_JSON));
        assertThat(reader.wearCounts(UUID.randomUUID())).containsEntry(id, 10L);
    }
    @Test
    void rejectsMissingCountsRatherThanDefaultingToNeverWorn() {
        server.expect(requestTo("http://outfit/api/app/outfits/wear-summary")).andRespond(withSuccess(
                "[{\"itemId\":\"" + UUID.randomUUID() + "\",\"lastWornAt\":\"2026-11-01T00:00:00Z\"}]", MediaType.APPLICATION_JSON));
        assertThatThrownBy(() -> reader.wearCounts(UUID.randomUUID())).isInstanceOf(WearHistoryUnavailableException.class);
    }
    @Test
    void rejectsNegativeCounts() {
        server.expect(requestTo("http://outfit/api/app/outfits/wear-summary")).andRespond(withSuccess(
                "[{\"itemId\":\"" + UUID.randomUUID() + "\",\"wearCount\":-1}]", MediaType.APPLICATION_JSON));
        assertThatThrownBy(() -> reader.wearCounts(UUID.randomUUID())).isInstanceOf(WearHistoryUnavailableException.class);
    }
}
