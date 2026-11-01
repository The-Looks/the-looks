package vn.thelooks.auth.presentation.response;

import java.time.Instant;
import java.util.UUID;
import vn.thelooks.auth.domain.enums.Role;

public record UserResponse(UUID id, String email, String username, Role role, Instant createdAt) {
}
