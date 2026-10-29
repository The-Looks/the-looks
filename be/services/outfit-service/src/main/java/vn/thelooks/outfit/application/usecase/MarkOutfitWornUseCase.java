package vn.thelooks.outfit.application.usecase;

import java.util.UUID;

/** Nút "Mặc bộ này": ghi WearLog. */
public interface MarkOutfitWornUseCase {

    void markWorn(UUID ownerId, UUID outfitId);
}
