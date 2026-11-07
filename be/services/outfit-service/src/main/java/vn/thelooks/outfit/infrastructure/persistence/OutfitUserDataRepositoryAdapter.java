package vn.thelooks.outfit.infrastructure.persistence;

import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import vn.thelooks.outfit.application.port.out.OutfitUserDataRepositoryPort;
import vn.thelooks.outfit.domain.model.AdminOutfitSummary;

@Repository
class OutfitUserDataRepositoryAdapter implements OutfitUserDataRepositoryPort {
    private final JdbcTemplate jdbc;
    OutfitUserDataRepositoryAdapter(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public AdminOutfitSummary summary(UUID userId) {
        Long count = jdbc.queryForObject("SELECT count(*) FROM outfit_outfit WHERE owner_id=?", Long.class, userId);
        return new AdminOutfitSummary(count == null ? 0 : count);
    }

    @Transactional
    public void delete(UUID userId) {
        jdbc.queryForObject("SELECT count(*) FROM (SELECT pg_advisory_xact_lock(hashtextextended(?,0))) l", Long.class, userId.toString());
        jdbc.update("INSERT INTO outfit_deleted_owner(owner_id) VALUES (?) ON CONFLICT DO NOTHING", userId);
        jdbc.update("DELETE FROM affiliate_click WHERE owner_id=?", userId);
        jdbc.update("DELETE FROM outfit_ai_usage WHERE owner_id=?", userId);
        jdbc.update("DELETE FROM outfit_feedback WHERE owner_id=?", userId);
        jdbc.update("DELETE FROM outfit_preferences WHERE owner_id=?", userId);
        jdbc.update("DELETE FROM outfit_wear_plan WHERE owner_id=?", userId);
        jdbc.update("DELETE FROM outfit_outfit WHERE owner_id=?", userId);
    }
}
