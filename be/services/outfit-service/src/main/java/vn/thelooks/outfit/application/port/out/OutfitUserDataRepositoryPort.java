package vn.thelooks.outfit.application.port.out;

import java.util.UUID;
import vn.thelooks.outfit.domain.model.AdminOutfitSummary;

public interface OutfitUserDataRepositoryPort {
    AdminOutfitSummary summary(UUID userId);
    void delete(UUID userId);
}
