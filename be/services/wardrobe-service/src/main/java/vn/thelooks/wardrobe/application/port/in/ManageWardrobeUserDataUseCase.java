package vn.thelooks.wardrobe.application.port.in;

import java.util.UUID;
import vn.thelooks.wardrobe.domain.model.AdminWardrobeSummary;

public interface ManageWardrobeUserDataUseCase {
    AdminWardrobeSummary summary(UUID userId);
    void delete(UUID userId);
}
