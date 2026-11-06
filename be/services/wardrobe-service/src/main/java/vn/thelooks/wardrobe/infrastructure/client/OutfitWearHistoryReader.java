package vn.thelooks.wardrobe.infrastructure.client;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import vn.thelooks.wardrobe.application.port.out.WearHistoryReader;
import vn.thelooks.wardrobe.application.port.out.WearHistoryUnavailableException;

@Component
class OutfitWearHistoryReader implements WearHistoryReader {
    record ItemWear(UUID itemId, long wearCount, Instant lastWornAt) {}
    private final RestClient outfit;
    OutfitWearHistoryReader(@Qualifier("outfitHistoryRestClient") RestClient outfit) { this.outfit = outfit; }
    public Map<UUID, Instant> lastWornAt(UUID ownerId) {
        try {
            var rows = outfit.get().uri("/api/app/outfits/wear-summary").retrieve().body(ItemWear[].class);
            if (rows == null) throw new WearHistoryUnavailableException(null);
            Map<UUID, Instant> result = new HashMap<>();
            for (var row : rows) if (row.lastWornAt() != null) result.put(row.itemId(), row.lastWornAt());
            return result;
        } catch (RestClientException e) { throw new WearHistoryUnavailableException(e); }
    }
}
