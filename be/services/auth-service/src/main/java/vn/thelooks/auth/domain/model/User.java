package vn.thelooks.auth.domain.model;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import vn.thelooks.auth.domain.enums.UserStatus;

public record User(
        UUID id,
        String email,
        String passwordHash,
        String username,
        boolean emailVerified,
        Set<String> roles,
        Set<String> permissions,
        UserStatus status,
        Instant createdAt,
        Instant updatedAt) {

    public User {
        roles = Set.copyOf(roles);
        permissions = Set.copyOf(permissions);
    }
}
