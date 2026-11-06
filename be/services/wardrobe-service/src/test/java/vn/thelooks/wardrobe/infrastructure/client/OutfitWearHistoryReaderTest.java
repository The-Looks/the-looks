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
}
