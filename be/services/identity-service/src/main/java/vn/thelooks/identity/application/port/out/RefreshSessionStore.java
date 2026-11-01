package vn.thelooks.identity.application.port.out;

import java.time.Instant;
import java.util.UUID;

public interface RefreshSessionStore {

    Session create(UUID userId, Instant now, Instant expiresAt);

    Rotation rotate(String rawToken, Instant now);

    void revoke(String rawToken, Instant now);

    boolean isActive(UUID sessionId, UUID userId, Instant now);

    record Session(UUID id, String refreshToken, Instant expiresAt) {
    }

    record Rotation(Status status, UUID userId, UUID sessionId, String refreshToken, Instant expiresAt) {

        public enum Status { OK, INVALID, REUSED }

        public static Rotation invalid() {
            return new Rotation(Status.INVALID, null, null, null, null);
        }

        public static Rotation reused() {
            return new Rotation(Status.REUSED, null, null, null, null);
        }
    }
}
