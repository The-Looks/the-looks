package vn.thelooks.outfit.adapter.out.persistence;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import vn.thelooks.outfit.domain.WearLog;

@Entity
@Table(name = "outfit_wear_log")
public class WearLogEntity {

    @Id
    private UUID id;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(name = "outfit_id", nullable = false)
    private UUID outfitId;

    @Column(name = "worn_at", nullable = false)
    private Instant wornAt;

    @ElementCollection
    @CollectionTable(name = "outfit_wear_log_item", joinColumns = @JoinColumn(name = "wear_log_id"))
    @Column(name = "item_id", nullable = false)
    private List<UUID> itemIds = new ArrayList<>();

    protected WearLogEntity() {
    }

    static WearLogEntity from(WearLog log) {
        WearLogEntity e = new WearLogEntity();
        e.id = log.id();
        e.ownerId = log.ownerId();
        e.outfitId = log.outfitId();
        e.wornAt = log.wornAt();
        e.itemIds = new ArrayList<>(log.itemIds());
        return e;
    }

    WearLog toDomain() {
        return new WearLog(id, ownerId, outfitId, List.copyOf(itemIds), wornAt);
    }
}
