package vn.thelooks.identity.domain.model;

import java.time.Instant;
import java.util.UUID;

public record User(
        UUID id,
        String email,
        String passwordHash,
        String username,
        boolean emailVerified,
        Role role,
        UserStatus status,
        Instant createdAt,
        Instant updatedAt) {
}
