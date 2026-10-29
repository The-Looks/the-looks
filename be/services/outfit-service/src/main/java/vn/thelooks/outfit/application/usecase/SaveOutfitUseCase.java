package vn.thelooks.outfit.application.usecase;

import java.util.List;
import java.util.UUID;
import vn.thelooks.outfit.domain.model.Occasion;
import vn.thelooks.outfit.domain.model.Outfit;

public interface SaveOutfitUseCase {

    /** @param occasion có thể null */
    Outfit save(UUID ownerId, List<UUID> itemIds, Occasion occasion);
}
