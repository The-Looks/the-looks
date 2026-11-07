package vn.thelooks.wardrobe.application.port.out;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public interface WearHistoryReader {
    Map<UUID, Instant> lastWornAt(UUID ownerId);
}
