package vn.thelooks.identity.domain.model;

import java.time.Instant;
import java.util.UUID;

public record User(
        UUID id,
        String email,
        String passwordHash,
        String displayName,
        Role role,
        Instant createdAt) {
}
