package vn.thelooks.outfit.application.port.in;

import java.util.List;
import java.util.UUID;
import vn.thelooks.outfit.domain.Occasion;
import vn.thelooks.outfit.domain.Outfit;

public interface SaveOutfitUseCase {

    /** @param occasion có thể null */
    Outfit save(UUID ownerId, List<UUID> itemIds, Occasion occasion);
}
