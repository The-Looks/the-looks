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
import vn.thelooks.wardrobe.application.port.out.WearCountReader;
import vn.thelooks.wardrobe.application.port.out.WearHistoryUnavailableException;

@Component
class OutfitWearHistoryReader implements WearHistoryReader, WearCountReader {
    record ItemWear(UUID itemId, Long wearCount, Instant lastWornAt) {}
    private final RestClient outfit;
    OutfitWearHistoryReader(@Qualifier("outfitHistoryRestClient") RestClient outfit) { this.outfit = outfit; }
    /** ownerId lấy từ JWT chuyển tiếp, không gửi ID từ client sang outfit-service. */
    private ItemWear[] summary() {
        try {
            var rows = outfit.get().uri("/api/app/outfits/wear-summary").retrieve().body(ItemWear[].class);
            if (rows == null) throw new WearHistoryUnavailableException(null);
            var seen = new java.util.HashSet<UUID>();
            for (var row : rows) {
                if (row == null || row.itemId() == null || row.wearCount() == null || row.wearCount() < 0 || !seen.add(row.itemId())) {
                    throw new WearHistoryUnavailableException(null);
                }
            }
            return rows;
        } catch (RestClientException e) { throw new WearHistoryUnavailableException(e); }
    }
    public Map<UUID, Instant> lastWornAt(UUID ownerId) {
        Map<UUID, Instant> result = new HashMap<>();
        for (var row : summary()) if (row.lastWornAt() != null) result.put(row.itemId(), row.lastWornAt());
        return result;
    }
    public Map<UUID, Long> wearCounts(UUID ownerId) {
        Map<UUID, Long> result = new HashMap<>();
        for (var row : summary()) result.put(row.itemId(), row.wearCount());
        return result;
    }
}
