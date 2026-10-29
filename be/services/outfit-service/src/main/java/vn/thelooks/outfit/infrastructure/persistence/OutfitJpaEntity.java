package vn.thelooks.outfit.infrastructure.persistence;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import vn.thelooks.outfit.domain.model.Occasion;
import vn.thelooks.outfit.domain.model.Outfit;

@Entity
@Table(name = "outfit_outfit")
public class OutfitJpaEntity {

    @Id
    private UUID id;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "occasion", length = 20)
    private Occasion occasion;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @ElementCollection
    @CollectionTable(name = "outfit_outfit_item", joinColumns = @JoinColumn(name = "outfit_id"))
    @OrderColumn(name = "item_order")
    @Column(name = "item_id", nullable = false)
    private List<UUID> itemIds = new ArrayList<>();

    protected OutfitJpaEntity() {
    }

    static OutfitJpaEntity from(Outfit outfit) {
        OutfitJpaEntity e = new OutfitJpaEntity();
        e.id = outfit.id();
        e.ownerId = outfit.ownerId();
        e.occasion = outfit.occasion();
        e.createdAt = outfit.createdAt();
        e.itemIds = new ArrayList<>(outfit.itemIds());
        return e;
    }

    Outfit toDomain() {
        return new Outfit(id, ownerId, List.copyOf(itemIds), occasion, createdAt);
    }
}
