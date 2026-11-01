package vn.thelooks.identity.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;
import vn.thelooks.identity.domain.model.Role;
import vn.thelooks.identity.domain.model.User;
import vn.thelooks.identity.domain.model.UserStatus;

@Entity
@Table(name = "users")
class UserJpaEntity extends BaseEntity {

    @Id
    private UUID id;

    @Column(nullable = false, length = 320)
    private String email;

    @Column(nullable = false, length = 60)
    private String username;

    @Column(name = "password_hash", columnDefinition = "text")
    private String passwordHash;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private UserStatus status;

    protected UserJpaEntity() {
    }

    static UserJpaEntity fromNew(User user) {
        var entity = new UserJpaEntity();
        entity.id = user.id();
        entity.updateFrom(user);
        return entity;
    }

    void updateFrom(User user) {
        email = user.email();
        username = user.username();
        passwordHash = user.passwordHash();
        emailVerified = user.emailVerified();
        role = user.role();
        status = user.status();
    }

    User toDomain() {
        return new User(id, email, passwordHash, username, emailVerified, role, status,
                getCreatedAt(), getUpdatedAt());
    }
}
