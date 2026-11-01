package vn.thelooks.voting.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import vn.thelooks.voting.application.port.out.PollRepository;
import vn.thelooks.voting.domain.model.Poll;

@Repository
class PollRepositoryAdapter implements PollRepository {

    private final SpringDataPollRepository repository;

    PollRepositoryAdapter(SpringDataPollRepository repository) {
        this.repository = repository;
    }

    @Override
    public Poll save(Poll poll) {
        return repository.saveAndFlush(PollJpaEntity.from(poll)).toDomain();
    }

    @Override
    public Optional<Poll> findByCode(String code) {
        return repository.findByCode(code).map(PollJpaEntity::toDomain);
    }

    @Override
    public List<Poll> findByOwner(UUID ownerId) {
        return repository.findByOwnerIdOrderByCreatedAtDesc(ownerId).stream().map(PollJpaEntity::toDomain).toList();
    }
}
