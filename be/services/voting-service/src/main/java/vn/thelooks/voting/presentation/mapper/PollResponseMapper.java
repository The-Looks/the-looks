package vn.thelooks.voting.presentation.mapper;

import vn.thelooks.voting.domain.model.Poll;
import vn.thelooks.voting.domain.model.PollResult;
import vn.thelooks.voting.presentation.response.PollResponse;

public final class PollResponseMapper {

    private PollResponseMapper() {
    }

    public static PollResponse toResponse(Poll poll, PollResult result) {
        return new PollResponse(poll.code(), poll.question(),
                new PollResponse.Option(poll.optionA().outfitId(), poll.optionA().imageUrls()),
                new PollResponse.Option(poll.optionB().outfitId(), poll.optionB().imageUrls()),
                poll.expiresAt(), toResult(result));
    }

    public static PollResponse.Result toResult(PollResult result) {
        return new PollResponse.Result(result.votesA(), result.votesB(), result.percentA(), result.percentB());
    }
}
