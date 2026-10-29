package vn.thelooks.outfit.application.usecase;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import vn.thelooks.outfit.domain.model.Outfit;
import vn.thelooks.outfit.domain.model.OutfitView;

public interface GetOutfitsQuery {

    /** Outfit đã lưu, mới nhất trước. */
    List<Outfit> mine(UUID ownerId);

    /** Outfit kèm ảnh. Rỗng nếu không tồn tại hoặc không thuộc ownerId. */
    Optional<OutfitView> view(UUID ownerId, UUID outfitId);
}
