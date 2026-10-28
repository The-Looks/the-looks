package vn.thelooks.outfit.application.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import vn.thelooks.outfit.domain.Outfit;

public interface OutfitRepository {

    Outfit save(Outfit outfit);

    Optional<Outfit> findById(UUID id);

    List<Outfit> findByOwner(UUID ownerId);
}
