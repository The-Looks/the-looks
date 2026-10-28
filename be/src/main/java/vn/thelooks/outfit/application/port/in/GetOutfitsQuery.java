package vn.thelooks.outfit.application.port.in;

import java.util.List;
import java.util.UUID;
import vn.thelooks.outfit.domain.Outfit;

public interface GetOutfitsQuery {

    /** Outfit đã lưu, mới nhất trước. */
    List<Outfit> mine(UUID ownerId);
}
