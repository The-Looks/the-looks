package vn.thelooks.outfit.application.port.in;

import java.util.UUID;

/** Nút "Mặc bộ này": ghi WearLog. */
public interface MarkOutfitWornUseCase {

    void markWorn(UUID ownerId, UUID outfitId);
}
