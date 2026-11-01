package vn.thelooks.auth.domain.model;

import java.time.Instant;
import java.util.UUID;
import vn.thelooks.auth.domain.enums.Role;
import vn.thelooks.auth.domain.enums.UserStatus;

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
