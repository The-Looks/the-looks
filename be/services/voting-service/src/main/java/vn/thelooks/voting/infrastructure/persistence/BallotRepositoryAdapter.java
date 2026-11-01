package vn.thelooks.voting.infrastructure.persistence;

import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Repository;
import vn.thelooks.voting.application.port.out.BallotRepository;
import vn.thelooks.voting.domain.exception.AlreadyVotedException;
import vn.thelooks.voting.domain.model.Ballot;
import vn.thelooks.voting.domain.model.Choice;
import vn.thelooks.voting.domain.model.PollResult;

@Repository
class BallotRepositoryAdapter implements BallotRepository {

    private final SpringDataBallotRepository repository;

    BallotRepositoryAdapter(SpringDataBallotRepository repository) {
        this.repository = repository;
    }

    @Override
    public Ballot save(Ballot ballot) {
        try {
            repository.saveAndFlush(BallotJpaEntity.from(ballot));
            return ballot;
        } catch (DataIntegrityViolationException e) {
            throw new AlreadyVotedException("Bạn đã bình chọn cho link này");
        }
    }

    @Override
    public boolean exists(UUID pollId, String voterKey) {
        return repository.existsByPollIdAndVoterKey(pollId, voterKey);
    }

    @Override
    public PollResult tally(UUID pollId) {
        return new PollResult(repository.countByPollIdAndChoice(pollId, Choice.A),
                repository.countByPollIdAndChoice(pollId, Choice.B));
    }
}
