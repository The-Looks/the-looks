package vn.thelooks.auth.infrastructure.persistence.adapter;

import java.util.LinkedHashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import vn.thelooks.auth.application.port.out.UserPersistencePort;
import vn.thelooks.auth.domain.exception.UserAlreadyExistsException;
import vn.thelooks.auth.domain.model.User;
import vn.thelooks.auth.infrastructure.persistence.entity.UserJpaEntity;
import vn.thelooks.auth.infrastructure.persistence.mapper.UserPersistenceMapper;
import vn.thelooks.auth.infrastructure.persistence.repository.UserRepository;

@Repository
class JpaUserPersistenceAdapter implements UserPersistencePort {

    private final UserRepository repository;
    private final JdbcTemplate jdbc;
    private final NamedParameterJdbcTemplate namedJdbc;

    JpaUserPersistenceAdapter(UserRepository repository, JdbcTemplate jdbc) {
        this.repository = repository;
        this.jdbc = jdbc;
        this.namedJdbc = new NamedParameterJdbcTemplate(jdbc);
    }

    @Override
    @Transactional
    public User save(User user) {
        var entity = repository.findById(user.id()).orElseGet(() -> UserJpaEntity.withId(user.id()));
        UserPersistenceMapper.update(entity, user);
        UserJpaEntity saved;
        try {
            saved = repository.saveAndFlush(entity);
        } catch (DataIntegrityViolationException e) {
            throw new UserAlreadyExistsException("Email đã được sử dụng");
        }
        for (var roleCode : user.roles()) {
            jdbc.update("""
                    INSERT INTO user_roles (user_id, role_id)
                    VALUES (?, (SELECT id FROM roles WHERE code = ?))
                    ON CONFLICT DO NOTHING
                    """, user.id(), roleCode);
        }
        if (user.roles().isEmpty()) {
            jdbc.update("DELETE FROM user_roles WHERE user_id = ?", user.id());
        } else {
            namedJdbc.update("""
                    DELETE FROM user_roles WHERE user_id = :userId
                    AND role_id NOT IN (SELECT id FROM roles WHERE code IN (:roleCodes))
                    """, new MapSqlParameterSource()
                    .addValue("userId", user.id()).addValue("roleCodes", user.roles()));
        }
        return hydrate(saved);
    }

    @Override
    public Optional<User> findById(UUID id) {
        return repository.findById(id).map(this::hydrate);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return repository.findByEmailIgnoreCase(email).map(this::hydrate);
    }

    @Override
    public boolean existsByEmail(String email) {
        return repository.existsByEmailIgnoreCase(email);
    }

    private User hydrate(UserJpaEntity entity) {
        var roles = new LinkedHashSet<>(jdbc.query("""
                SELECT r.code FROM roles r JOIN user_roles ur ON ur.role_id = r.id
                WHERE ur.user_id = ? ORDER BY r.code
                """, (rs, row) -> rs.getString(1), entity.getId()));
        var permissions = new LinkedHashSet<>(jdbc.query("""
                SELECT DISTINCT p.code FROM permissions p
                JOIN role_permissions rp ON rp.permission_id = p.id
                JOIN user_roles ur ON ur.role_id = rp.role_id
                WHERE ur.user_id = ? ORDER BY p.code
                """, (rs, row) -> rs.getString(1), entity.getId()));
        return UserPersistenceMapper.toDomain(entity, Set.copyOf(roles), Set.copyOf(permissions));
    }
}
