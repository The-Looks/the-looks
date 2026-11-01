package vn.thelooks.outfit.infrastructure.persistence;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
import vn.thelooks.outfit.application.port.out.FeedbackRepository;
import vn.thelooks.outfit.domain.model.Feedback;

/** Bảng phẳng, khoá (owner_id, combo_key): dùng JdbcClient + upsert thay vì entity JPA khoá kép. */
@Component
class FeedbackRepositoryAdapter implements FeedbackRepository {

    private final JdbcClient jdbc;

    FeedbackRepositoryAdapter(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void save(UUID ownerId, String comboKey, Feedback feedback, Instant at) {
        jdbc.sql("""
                insert into outfit_feedback (owner_id, combo_key, vote, updated_at)
                values (:owner, :combo, :vote, :at)
                on conflict (owner_id, combo_key) do update set vote = excluded.vote, updated_at = excluded.updated_at
                """)
                .param("owner", ownerId)
                .param("combo", comboKey)
                .param("vote", feedback.name())
                .param("at", Timestamp.from(at))
                .update();
    }

    @Override
    public Map<String, Feedback> byOwner(UUID ownerId) {
        Map<String, Feedback> result = new HashMap<>();
        jdbc.sql("select combo_key, vote from outfit_feedback where owner_id = :owner")
                .param("owner", ownerId)
                .query((rs, n) -> result.put(rs.getString("combo_key"), Feedback.valueOf(rs.getString("vote"))))
                .list();
        return result;
    }
}
