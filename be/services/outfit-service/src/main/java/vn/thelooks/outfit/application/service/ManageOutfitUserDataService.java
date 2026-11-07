package vn.thelooks.outfit.application.service;

import java.util.UUID;
import org.springframework.stereotype.Service;
import vn.thelooks.outfit.application.port.in.ManageOutfitUserDataUseCase;
import vn.thelooks.outfit.application.port.out.OutfitUserDataRepositoryPort;
import vn.thelooks.outfit.domain.model.AdminOutfitSummary;

@Service
class ManageOutfitUserDataService implements ManageOutfitUserDataUseCase {
    private final OutfitUserDataRepositoryPort repository;
    ManageOutfitUserDataService(OutfitUserDataRepositoryPort repository) { this.repository = repository; }
    public AdminOutfitSummary summary(UUID userId) { return repository.summary(userId); }
    public void delete(UUID userId) { repository.delete(userId); }
}
