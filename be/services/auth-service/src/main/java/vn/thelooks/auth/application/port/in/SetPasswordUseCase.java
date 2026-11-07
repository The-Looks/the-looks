package vn.thelooks.auth.application.port.in;

import java.util.UUID;

public interface SetPasswordUseCase {
    boolean hasPassword(UUID userId);
    void setup(UUID userId, UUID sessionId, String password);
}
