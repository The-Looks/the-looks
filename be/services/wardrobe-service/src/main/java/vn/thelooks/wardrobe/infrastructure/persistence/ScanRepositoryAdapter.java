package vn.thelooks.wardrobe.infrastructure.persistence;

import java.sql.Timestamp;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import vn.thelooks.wardrobe.application.port.out.ScanRepository;
import vn.thelooks.wardrobe.domain.model.Scan;
import vn.thelooks.wardrobe.domain.model.ScanStatus;

/** itemIds không lưu riêng: tính từ wardrobe_item.scan_id. */
@Component
class ScanRepositoryAdapter implements ScanRepository {

    private final JdbcClient jdbc;
    private final TransactionTemplate tx;

    ScanRepositoryAdapter(JdbcClient jdbc, PlatformTransactionManager transactions) {
        this.jdbc = jdbc;
        this.tx = new TransactionTemplate(transactions);
    }

    /** Khoá theo người dùng tới hết transaction: hai request trùng tới cùng lúc phải chờ nhau rồi mới kiểm tra. */
    @Override
    public Scan saveUnlessDuplicate(Scan s, String contentHash, Duration window) {
        return tx.execute(status -> {
            jdbc.sql("select count(*) from (select pg_advisory_xact_lock(hashtextextended(:owner, 0))) l")
                    .param("owner", s.ownerId().toString()).query(Long.class).single();
            boolean deleted = jdbc.sql("select exists(select 1 from wardrobe_deleted_owner where owner_id=:owner)")
                    .param("owner",s.ownerId()).query(Boolean.class).single();
            if (deleted) throw new IllegalStateException("Tài khoản đang được xóa");
            Optional<UUID> existing = jdbc.sql("""
                    select id from wardrobe_scan
                    where owner_id = :owner and content_hash = :hash and created_at > :since
                    order by created_at desc limit 1
                    """)
                    .param("owner", s.ownerId())
                    .param("hash", contentHash)
                    .param("since", Timestamp.from(s.createdAt().minus(window)))
                    .query(UUID.class).optional();
            if (existing.isPresent()) {
                return findById(existing.get()).orElseThrow();
            }
            save(s);
            jdbc.sql("update wardrobe_scan set content_hash = :hash where id = :id")
                    .param("hash", contentHash).param("id", s.id()).update();
            return s;
        });
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
