package vn.thelooks.outfit.adapter.out.persistence;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.thelooks.outfit.application.port.out.OutfitRepository;
import vn.thelooks.outfit.application.port.out.WearLogRepository;
import vn.thelooks.outfit.domain.Outfit;
import vn.thelooks.outfit.domain.WearLog;

@Component
class OutfitPersistenceAdapter implements OutfitRepository, WearLogRepository {

    private final OutfitJpaRepository outfits;
    private final WearLogJpaRepository wearLogs;

    OutfitPersistenceAdapter(OutfitJpaRepository outfits, WearLogJpaRepository wearLogs) {
        this.outfits = outfits;
        this.wearLogs = wearLogs;
    }

    @Override
    public Outfit save(Outfit outfit) {
        return outfits.save(OutfitEntity.from(outfit)).toDomain();
    }

    @Override
    public Optional<Outfit> findById(UUID id) {
        return outfits.findById(id).map(OutfitEntity::toDomain);
    }

    @Override
    public List<Outfit> findByOwner(UUID ownerId) {
        return outfits.findByOwnerIdOrderByCreatedAtDesc(ownerId).stream().map(OutfitEntity::toDomain).toList();
    }

    @Override
    public WearLog save(WearLog log) {
        return wearLogs.save(WearLogEntity.from(log)).toDomain();
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
