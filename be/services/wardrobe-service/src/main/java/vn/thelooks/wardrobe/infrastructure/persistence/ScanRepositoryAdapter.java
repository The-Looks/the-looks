package vn.thelooks.wardrobe.infrastructure.persistence;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
import vn.thelooks.wardrobe.application.port.out.ScanRepository;
import vn.thelooks.wardrobe.domain.model.Scan;
import vn.thelooks.wardrobe.domain.model.ScanStatus;

/** itemIds không lưu riêng: tính từ wardrobe_item.scan_id. */
@Component
class ScanRepositoryAdapter implements ScanRepository {

    private final JdbcClient jdbc;

    ScanRepositoryAdapter(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public Scan save(Scan s) {
        jdbc.sql("""
                insert into wardrobe_scan (id, owner_id, status, image_count, skipped_for_limit, created_at)
                values (:id, :owner, :status, :count, :skipped, :at)
                on conflict (id) do update set status = excluded.status, skipped_for_limit = excluded.skipped_for_limit
                """)
                .param("id", s.id())
                .param("owner", s.ownerId())
                .param("status", s.status().name())
                .param("count", s.imageCount())
                .param("skipped", s.skippedForLimit())
                .param("at", Timestamp.from(s.createdAt()))
                .update();
        return s;
    }

    @Override
    public Optional<Scan> findById(UUID id) {
        return jdbc.sql("select * from wardrobe_scan where id = :id").param("id", id)
                .query((rs, n) -> new Scan(
                        rs.getObject("id", UUID.class),
                        rs.getObject("owner_id", UUID.class),
                        ScanStatus.valueOf(rs.getString("status")),
                        rs.getInt("image_count"),
                        itemIds(id),
                        rs.getInt("skipped_for_limit"),
                        rs.getTimestamp("created_at").toInstant()))
                .optional();
    }

    private List<UUID> itemIds(UUID scanId) {
        return jdbc.sql("select id from wardrobe_item where scan_id = :scan order by created_at")
                .param("scan", scanId).query(UUID.class).list();
    }
}
