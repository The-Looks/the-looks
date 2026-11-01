package vn.thelooks.voting.infrastructure.persistence.adapter;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import vn.thelooks.voting.application.port.out.PollRepository;
import vn.thelooks.voting.domain.model.Poll;
import vn.thelooks.voting.infrastructure.persistence.mapper.PollPersistenceMapper;
import vn.thelooks.voting.infrastructure.persistence.repository.SpringDataPollRepository;

@Repository
class PollRepositoryAdapter implements PollRepository {

    private final SpringDataPollRepository repository;

    PollRepositoryAdapter(SpringDataPollRepository repository) {
        this.repository = repository;
    }

    @Override
    public Poll save(Poll poll) {
        return PollPersistenceMapper.toDomain(repository.saveAndFlush(PollPersistenceMapper.toEntity(poll)));
    }

    @Override
    public Optional<Poll> findByCode(String code) {
        return repository.findByCode(code).map(PollPersistenceMapper::toDomain);
    }

    @Override
    public List<Poll> findByOwner(UUID ownerId) {
        return repository.findByOwnerIdOrderByCreatedAtDesc(ownerId).stream()
                .map(PollPersistenceMapper::toDomain).toList();
    }
}
