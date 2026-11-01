package vn.thelooks.auth.presentation.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record UserResponse(UUID id, String email, String username, List<String> roles, Instant createdAt) {
}
