package vn.thelooks.auth.presentation.response;

import java.time.Instant;

public record AccessTokenResponse(String accessToken, Instant expiresAt) {
}
