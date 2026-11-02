package vn.thelooks.voting.application.port.out;

import java.util.UUID;
import vn.thelooks.voting.domain.model.Ballot;
import vn.thelooks.voting.domain.model.PollResult;

public interface BallotRepository {

    Ballot save(Ballot ballot);

    boolean exists(UUID pollId, String voterKey);

    long countByIp(UUID pollId, String ipKey);

    PollResult tally(UUID pollId);
}
