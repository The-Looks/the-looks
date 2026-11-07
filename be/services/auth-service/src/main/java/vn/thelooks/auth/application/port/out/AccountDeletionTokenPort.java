package vn.thelooks.auth.application.port.out;

import java.util.UUID;

public interface AccountDeletionTokenPort {
    String issue(UUID targetId);
}
