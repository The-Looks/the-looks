package vn.thelooks.identity.infrastructure.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Repository;
import vn.thelooks.identity.application.port.out.UserRepository;
import vn.thelooks.identity.domain.exception.UserAlreadyExistsException;
import vn.thelooks.identity.domain.model.User;

@Repository
class UserRepositoryAdapter implements UserRepository {

    private final SpringDataUserRepository repository;

    UserRepositoryAdapter(SpringDataUserRepository repository) {
        this.repository = repository;
    }

    @Override
    public User save(User user) {
        var entity = repository.findById(user.id()).orElseGet(() -> UserJpaEntity.fromNew(user));
        entity.updateFrom(user);
        try {
            return repository.saveAndFlush(entity).toDomain();
        } catch (DataIntegrityViolationException e) {
            throw new UserAlreadyExistsException("Email đã được sử dụng");
        }
    }

    @Override
    public Optional<User> findById(UUID id) {
        return repository.findById(id).map(UserJpaEntity::toDomain);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return repository.findByEmailIgnoreCase(email).map(UserJpaEntity::toDomain);
    }

    @Override
    public boolean existsByEmail(String email) {
        return repository.existsByEmailIgnoreCase(email);
    }
}
