package vn.thelooks.auth.domain.model;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AdminUserDetail(UUID id, String username, String email, String status, boolean emailVerified,
        Instant createdAt, List<String> roles, List<String> permissions) {
    public AdminUserDetail {
        roles = List.copyOf(roles);
        permissions = List.copyOf(permissions);
    }
}
