package vn.thelooks.voting.presentation.response;

import java.net.URI;
import java.time.Instant;

public record CreatedPollResponse(String code, URI shareUrl, Instant expiresAt) {
}
