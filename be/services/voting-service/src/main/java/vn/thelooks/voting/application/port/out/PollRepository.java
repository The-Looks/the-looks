package vn.thelooks.voting.application.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import vn.thelooks.voting.domain.model.Poll;

public interface PollRepository {

    Poll save(Poll poll);

    Optional<Poll> findByCode(String code);

    List<Poll> findByOwner(UUID ownerId);
}
