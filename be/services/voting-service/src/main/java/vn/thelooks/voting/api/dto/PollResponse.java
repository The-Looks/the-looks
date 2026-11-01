package vn.thelooks.voting.api.dto;

import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import vn.thelooks.voting.domain.model.Poll;
import vn.thelooks.voting.domain.model.PollResult;

public record PollResponse(String code, String question, Option optionA, Option optionB,
        Instant expiresAt, Result result) {

    public static PollResponse from(Poll poll, PollResult result) {
        return new PollResponse(poll.code(), poll.question(),
                new Option(poll.optionA().outfitId(), poll.optionA().imageUrls()),
                new Option(poll.optionB().outfitId(), poll.optionB().imageUrls()),
                poll.expiresAt(), Result.from(result));
    }

    public record Option(UUID outfitId, List<URI> imageUrls) {
    }

    public record Result(long votesA, long votesB, int percentA, int percentB) {

        public static Result from(PollResult result) {
            return new Result(result.votesA(), result.votesB(), result.percentA(), result.percentB());
        }
    }
}
