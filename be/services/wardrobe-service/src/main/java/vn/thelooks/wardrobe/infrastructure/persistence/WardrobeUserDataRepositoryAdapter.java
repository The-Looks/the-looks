package vn.thelooks.wardrobe.infrastructure.persistence;

import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import vn.thelooks.wardrobe.application.port.out.ImageStorage;
import vn.thelooks.wardrobe.application.port.out.WardrobeUserDataRepositoryPort;
import vn.thelooks.wardrobe.domain.model.AdminWardrobeSummary;

@Repository
class WardrobeUserDataRepositoryAdapter implements WardrobeUserDataRepositoryPort {
    private final JdbcTemplate jdbc;
    private final ImageStorage images;
    WardrobeUserDataRepositoryAdapter(JdbcTemplate jdbc, ImageStorage images) {
        this.jdbc = jdbc;
        this.images = images;
    }

    public AdminWardrobeSummary summary(UUID userId) {
        Long count = jdbc.queryForObject("SELECT count(*) FROM wardrobe_item WHERE owner_id=?", Long.class, userId);
        return new AdminWardrobeSummary(count == null ? 0 : count);
    }

    @Transactional
    public void delete(UUID userId) {
        jdbc.queryForObject("SELECT count(*) FROM (SELECT pg_advisory_xact_lock(hashtextextended(?,0))) l", Long.class, userId.toString());
        jdbc.update("INSERT INTO wardrobe_deleted_owner(owner_id) VALUES (?) ON CONFLICT DO NOTHING", userId);
        Long running = jdbc.queryForObject("SELECT count(*) FROM wardrobe_scan WHERE owner_id=? AND status='PROCESSING'", Long.class, userId);
        if (running != null && running > 0)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tủ đồ còn lần quét đang xử lý, thử lại sau");
        List<String> keys = jdbc.query("SELECT image_key FROM wardrobe_item WHERE owner_id=?",
                (rs, row) -> rs.getString(1), userId);
        for (String key : keys) images.delete(key);
        jdbc.update("DELETE FROM wardrobe_item WHERE owner_id=?", userId);
        jdbc.update("DELETE FROM wardrobe_scan WHERE owner_id=?", userId);
    }
}
