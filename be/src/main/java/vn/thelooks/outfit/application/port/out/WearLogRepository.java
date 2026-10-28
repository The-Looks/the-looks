package vn.thelooks.outfit.application.port.out;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import vn.thelooks.outfit.domain.WearLog;

public interface WearLogRepository {

    WearLog save(WearLog log);

    /** itemId → lần mặc gần nhất. Món chưa mặc lần nào không có trong map. */
    Map<UUID, Instant> lastWornAtByItem(UUID ownerId);
}
