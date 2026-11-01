package vn.thelooks.auth.infrastructure.persistence.mapper;

import java.util.Set;
import vn.thelooks.auth.domain.model.User;
import vn.thelooks.auth.infrastructure.persistence.entity.UserJpaEntity;

public final class UserPersistenceMapper {

    private UserPersistenceMapper() {
    }

    public static void update(UserJpaEntity entity, User user) {
        entity.setDetails(user.email(), user.username(), user.passwordHash(),
                user.emailVerified(), user.status());
    }

    public static User toDomain(UserJpaEntity entity, Set<String> roles, Set<String> permissions) {
        return new User(entity.getId(), entity.getEmail(), entity.getPasswordHash(),
                entity.getUsername(), entity.isEmailVerified(), roles, permissions, entity.getStatus(),
                entity.getCreatedAt(), entity.getUpdatedAt());
    }
}
