package vn.thelooks.auth.application.service;

import java.util.UUID;
import org.springframework.stereotype.Service;
import vn.thelooks.auth.application.port.in.DeleteUserAccountUseCase;
import vn.thelooks.auth.application.port.out.AccountDeletionCoordinatorPort;
import vn.thelooks.auth.domain.model.AccountDeletionJob;

@Service
class DeleteUserAccountService implements DeleteUserAccountUseCase {
    private final AccountDeletionCoordinatorPort coordinator;
    DeleteUserAccountService(AccountDeletionCoordinatorPort coordinator) { this.coordinator = coordinator; }
    public AccountDeletionJob get(UUID targetId) { return coordinator.get(targetId); }
    public AccountDeletionJob startOrRetry(UUID actorId, UUID targetId, String bearerToken) {
        return coordinator.startOrRetry(actorId, targetId, bearerToken);
    }
}
