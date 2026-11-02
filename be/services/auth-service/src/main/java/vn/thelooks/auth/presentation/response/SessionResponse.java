package vn.thelooks.auth.presentation.response;

import java.time.Instant;

/** The browser receives only expiry metadata; JWTs stay in HttpOnly cookies. */
public record SessionResponse(Instant expiresAt) {
}
