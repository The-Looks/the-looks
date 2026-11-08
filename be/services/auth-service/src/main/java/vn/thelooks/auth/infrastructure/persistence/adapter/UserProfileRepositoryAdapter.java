package vn.thelooks.auth.infrastructure.persistence.adapter;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import vn.thelooks.auth.application.port.in.ManageProfileUseCase.Avatar;
import vn.thelooks.auth.application.port.out.UserProfileRepositoryPort;
import vn.thelooks.auth.domain.model.UserProfile;

@Repository
class UserProfileRepositoryAdapter implements UserProfileRepositoryPort {
    private final JdbcTemplate jdbc;
    UserProfileRepositoryAdapter(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public UserProfile get(UUID userId) {
        return jdbc.query("""
                SELECT u.username, p.city, p.avatar_content_type, p.avatar_updated_at, p.mascot_id
                FROM users u LEFT JOIN user_profiles p ON p.user_id=u.id WHERE u.id=? AND u.status='ACTIVE'
                """, (rs, row) -> new UserProfile(rs.getString(1), rs.getString(2), rs.getString(3) != null,
                rs.getTimestamp(4) == null ? null : rs.getTimestamp(4).toInstant(), rs.getString(5)), userId)
                .stream().findFirst().orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tài khoản không tồn tại"));
    }

    @Transactional
    public UserProfile update(UUID userId, String username, String city) {
        if (jdbc.update("UPDATE users SET username=?,updated_at=now() WHERE id=? AND status='ACTIVE'", username, userId) != 1)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tài khoản không tồn tại");
        jdbc.update("""
                INSERT INTO user_profiles(user_id,city) VALUES (?,?)
                ON CONFLICT (user_id) DO UPDATE SET city=EXCLUDED.city,updated_at=now()
                """, userId, city);
        return get(userId);
    }

    @Transactional
    public UserProfile selectMascot(UUID userId, String mascotId) {
        get(userId);
        jdbc.update("""
                INSERT INTO user_profiles(user_id,mascot_id) VALUES (?,?)
                ON CONFLICT (user_id) DO UPDATE SET mascot_id=EXCLUDED.mascot_id,updated_at=now()
                """, userId, mascotId);
        return get(userId);
    }

    @Transactional
    public UserProfile saveAvatar(UUID userId, byte[] bytes, String contentType) {
        get(userId);
        jdbc.update("""
                INSERT INTO user_profiles(user_id,avatar_bytes,avatar_content_type,avatar_updated_at)
                VALUES (?,?,?,now()) ON CONFLICT (user_id) DO UPDATE SET
                avatar_bytes=EXCLUDED.avatar_bytes,avatar_content_type=EXCLUDED.avatar_content_type,
                avatar_updated_at=now(),updated_at=now()
                """, userId, bytes, contentType);
        return get(userId);
    }

    @Transactional
    public UserProfile removeAvatar(UUID userId) {
        get(userId);
        jdbc.update("""
                UPDATE user_profiles SET avatar_bytes=NULL,avatar_content_type=NULL,avatar_updated_at=NULL,updated_at=now()
                WHERE user_id=?
                """, userId);
        return get(userId);
    }

    public Avatar avatar(UUID userId) {
        get(userId);
        return jdbc.query("SELECT avatar_bytes,avatar_content_type FROM user_profiles WHERE user_id=? AND avatar_bytes IS NOT NULL",
                (rs, row) -> new Avatar(rs.getBytes(1), rs.getString(2)), userId)
                .stream().findFirst().orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chưa có ảnh đại diện"));
    }
}
