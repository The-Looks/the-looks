package vn.thelooks.auth.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;
import vn.thelooks.auth.domain.enums.Role;
import vn.thelooks.auth.domain.enums.UserStatus;

@Entity
@Table(name = "users")
public class UserJpaEntity extends BaseEntity {

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

    public static UserJpaEntity withId(UUID id) {
        var entity = new UserJpaEntity();
        entity.id = id;
        return entity;
    }

    public void setDetails(String email, String username, String passwordHash,
            boolean emailVerified, Role role, UserStatus status) {
        this.email = email;
        this.username = username;
        this.passwordHash = passwordHash;
        this.emailVerified = emailVerified;
        this.role = role;
        this.status = status;
    }

    public UUID getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getUsername() {
        return username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public Role getRole() {
        return role;
    }

    public UserStatus getStatus() {
        return status;
    }
}
