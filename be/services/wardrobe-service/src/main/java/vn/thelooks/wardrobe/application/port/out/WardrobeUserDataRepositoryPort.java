package vn.thelooks.wardrobe.application.port.out;

import java.util.UUID;
import vn.thelooks.wardrobe.domain.model.AdminWardrobeSummary;

public interface WardrobeUserDataRepositoryPort {
    AdminWardrobeSummary summary(UUID userId);
    void delete(UUID userId);
}
