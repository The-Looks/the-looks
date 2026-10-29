package vn.thelooks.outfit.infrastructure.persistence;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.thelooks.outfit.application.port.out.WearLogRepository;
import vn.thelooks.outfit.domain.model.WearLog;

@Component
class WearLogRepositoryAdapter implements WearLogRepository {

    private final SpringDataWearLogRepository wearLogs;

    WearLogRepositoryAdapter(SpringDataWearLogRepository wearLogs) {
        this.wearLogs = wearLogs;
    }

    @Override
    public WearLog save(WearLog log) {
        return wearLogs.save(WearLogJpaEntity.from(log)).toDomain();
    }

    @Override
    public Map<UUID, Instant> lastWornAtByItem(UUID ownerId) {
        Map<UUID, Instant> result = new HashMap<>();
        for (Object[] row : wearLogs.lastWornAtByItem(ownerId)) {
            result.put((UUID) row[0], (Instant) row[1]);
        }
        return result;
    }
}
