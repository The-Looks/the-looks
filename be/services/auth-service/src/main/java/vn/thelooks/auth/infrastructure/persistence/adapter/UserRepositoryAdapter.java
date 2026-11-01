package vn.thelooks.auth.infrastructure.persistence.adapter;

import java.util.Optional;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Repository;
import vn.thelooks.auth.application.port.out.UserRepository;
import vn.thelooks.auth.domain.exception.UserAlreadyExistsException;
import vn.thelooks.auth.domain.model.User;
import vn.thelooks.auth.infrastructure.persistence.entity.UserJpaEntity;
import vn.thelooks.auth.infrastructure.persistence.mapper.UserPersistenceMapper;
import vn.thelooks.auth.infrastructure.persistence.repository.SpringDataUserRepository;

@Repository
class UserRepositoryAdapter implements UserRepository {

    private final SpringDataUserRepository repository;

    UserRepositoryAdapter(SpringDataUserRepository repository) {
        this.repository = repository;
    }

    @Override
    public User save(User user) {
        var entity = repository.findById(user.id()).orElseGet(() -> UserJpaEntity.withId(user.id()));
        UserPersistenceMapper.update(entity, user);
        try {
            return UserPersistenceMapper.toDomain(repository.saveAndFlush(entity));
        } catch (DataIntegrityViolationException e) {
            throw new UserAlreadyExistsException("Email đã được sử dụng");
        }
    }

    @Override
    public Optional<User> findById(UUID id) {
        return repository.findById(id).map(UserPersistenceMapper::toDomain);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return repository.findByEmailIgnoreCase(email).map(UserPersistenceMapper::toDomain);
    }

    @Override
    public boolean existsByEmail(String email) {
        return repository.existsByEmailIgnoreCase(email);
    }
}
