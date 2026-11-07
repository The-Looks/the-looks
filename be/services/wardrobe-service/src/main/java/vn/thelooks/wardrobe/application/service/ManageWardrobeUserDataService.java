package vn.thelooks.wardrobe.application.service;

import java.util.UUID;
import org.springframework.stereotype.Service;
import vn.thelooks.wardrobe.application.port.in.ManageWardrobeUserDataUseCase;
import vn.thelooks.wardrobe.application.port.out.WardrobeUserDataRepositoryPort;
import vn.thelooks.wardrobe.domain.model.AdminWardrobeSummary;

@Service
class ManageWardrobeUserDataService implements ManageWardrobeUserDataUseCase {
    private final WardrobeUserDataRepositoryPort repository;
    ManageWardrobeUserDataService(WardrobeUserDataRepositoryPort repository) { this.repository = repository; }
    public AdminWardrobeSummary summary(UUID userId) { return repository.summary(userId); }
    public void delete(UUID userId) { repository.delete(userId); }
}
