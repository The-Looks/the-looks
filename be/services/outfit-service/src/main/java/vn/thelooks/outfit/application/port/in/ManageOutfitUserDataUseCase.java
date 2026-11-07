package vn.thelooks.outfit.application.port.in;

import java.util.UUID;
import vn.thelooks.outfit.domain.model.AdminOutfitSummary;

public interface ManageOutfitUserDataUseCase {
    AdminOutfitSummary summary(UUID userId);
    void delete(UUID userId);
}
