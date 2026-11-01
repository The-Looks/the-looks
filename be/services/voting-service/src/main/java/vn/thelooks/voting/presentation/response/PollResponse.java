package vn.thelooks.voting.presentation.response;

import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PollResponse(String code, String question, Option optionA, Option optionB,
        Instant expiresAt, Result result) {

    public record Option(UUID outfitId, List<URI> imageUrls) {
    }

    public record Result(long votesA, long votesB, int percentA, int percentB) {
    }
}
