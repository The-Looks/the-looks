package vn.thelooks.outfit.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.thelooks.outfit.application.port.out.OutfitRepository;
import vn.thelooks.outfit.domain.model.Outfit;

@Component
class OutfitRepositoryAdapter implements OutfitRepository {

    private final SpringDataOutfitRepository outfits;

    OutfitRepositoryAdapter(SpringDataOutfitRepository outfits) {
        this.outfits = outfits;
    }

    @Override
    public Outfit save(Outfit outfit) {
        return outfits.save(OutfitJpaEntity.from(outfit)).toDomain();
    }

    @Override
    public Optional<Outfit> findById(UUID id) {
        return outfits.findById(id).map(OutfitJpaEntity::toDomain);
    }

    @Override
    public List<Outfit> findByOwner(UUID ownerId) {
        return outfits.findByOwnerIdOrderByCreatedAtDesc(ownerId).stream().map(OutfitJpaEntity::toDomain).toList();
    }
}
