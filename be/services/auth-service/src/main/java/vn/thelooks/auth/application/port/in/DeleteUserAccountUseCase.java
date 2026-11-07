package vn.thelooks.auth.application.port.in;

import java.util.UUID;
import vn.thelooks.auth.domain.model.AccountDeletionJob;

public interface DeleteUserAccountUseCase {
    AccountDeletionJob get(UUID targetId);
    AccountDeletionJob startOrRetry(UUID actorId, UUID targetId);
}
