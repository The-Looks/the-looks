package vn.thelooks.auth.application.port.out;

import java.util.UUID;
import vn.thelooks.auth.domain.model.AccountDeletionJob;

public interface AccountDeletionCoordinatorPort {
    AccountDeletionJob get(UUID targetId);
    AccountDeletionJob startOrRetry(UUID actorId, UUID targetId, String bearerToken);
}
