package vn.thelooks.auth.application.port.out;

import java.time.Instant;
import java.util.UUID;

public interface PasswordSetupRepositoryPort {
    boolean hasPassword(UUID userId);
    boolean isRecentGoogleSession(UUID userId, UUID sessionId, Instant since);
    boolean setIfAbsent(UUID userId, String hash);
}
