package vn.thelooks.outfit.application.service;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import vn.thelooks.outfit.application.port.out.WearLogRepository;
import vn.thelooks.outfit.application.usecase.GetWearSummaryQuery;

@Service
class WearSummaryService implements GetWearSummaryQuery {
    private final WearLogRepository logs;
    WearSummaryService(WearLogRepository logs) { this.logs = logs; }
    public List<ItemWear> summary(UUID ownerId) {
        var counts = logs.wearCountByItem(ownerId);
        return logs.lastWornAtByItem(ownerId).entrySet().stream().sorted(java.util.Map.Entry.comparingByKey())
                .map(e -> new ItemWear(e.getKey(), counts.getOrDefault(e.getKey(), 0L), e.getValue())).toList();
    }
}
