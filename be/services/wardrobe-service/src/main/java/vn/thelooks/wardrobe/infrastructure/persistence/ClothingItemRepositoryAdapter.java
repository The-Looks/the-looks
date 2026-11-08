package vn.thelooks.wardrobe.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Arrays;
import java.util.Collection;
import java.util.EnumSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vn.thelooks.wardrobe.application.port.out.ClothingItemRepository;
import vn.thelooks.wardrobe.domain.model.Category;
import vn.thelooks.wardrobe.domain.model.ClothingAttributes;
import vn.thelooks.wardrobe.domain.model.ClothingItem;
import vn.thelooks.wardrobe.domain.model.ItemStatus;
import vn.thelooks.wardrobe.domain.model.Season;

@Component
class ClothingItemRepositoryAdapter implements ClothingItemRepository {

    private final JdbcClient jdbc;

    ClothingItemRepositoryAdapter(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    @Transactional
    public ClothingItem save(ClothingItem i) {
        jdbc.sql("select count(*) from (select pg_advisory_xact_lock(hashtextextended(:owner, 0))) l")
                .param("owner",i.ownerId().toString()).query(Long.class).single();
        boolean deleted = jdbc.sql("select exists(select 1 from wardrobe_deleted_owner where owner_id=:owner)")
                .param("owner",i.ownerId()).query(Boolean.class).single();
        if (deleted) throw new IllegalStateException("Tài khoản đang được xóa");
        ClothingAttributes a = i.attributes();
        jdbc.sql("""
                insert into wardrobe_item (id, owner_id, image_key, status, category, colors, material, seasons, style_tags,
                                           confidence, scan_id, created_at, purchase_price, purchase_date, brand)
                values (:id, :owner, :key, :status, :category, :colors, :material, :seasons, :tags, :confidence, :scan, :at, :price, :purchaseDate, :brand)
                on conflict (id) do update set status = excluded.status, category = excluded.category,
                    colors = excluded.colors, material = excluded.material, seasons = excluded.seasons,
                    style_tags = excluded.style_tags, purchase_price = excluded.purchase_price,
                    purchase_date = excluded.purchase_date, brand = excluded.brand
                """)
                .param("id", i.id())
                .param("owner", i.ownerId())
                .param("key", i.imageKey())
                .param("status", i.status().name())
                .param("category", a == null || a.category() == null ? null : a.category().name())
                .param("colors", join(a == null ? null : a.colors()))
                .param("material", a == null ? null : a.material())
                .param("seasons", join(a == null || a.seasons() == null ? null : a.seasons().stream().map(Enum::name).toList()))
                .param("tags", join(a == null ? null : a.styleTags()))
                .param("confidence", i.confidence())
                .param("scan", i.scanId())
                .param("at", Timestamp.from(i.createdAt()))
                .param("price", a == null ? null : a.purchasePrice())
                .param("purchaseDate", a == null ? null : a.purchaseDate(), java.sql.Types.DATE)
                .param("brand", a == null ? null : a.brand())
                .update();
        return i;
    }

    @Override
    public Optional<ClothingItem> findById(UUID id) {
        return jdbc.sql("select * from wardrobe_item where id = :id").param("id", id).query(ClothingItemRepositoryAdapter::map).optional();
    }

    @Override
    public List<ClothingItem> findByOwner(UUID ownerId, ItemStatus status) {
        return jdbc.sql("""
                select * from wardrobe_item where owner_id = :owner
                  and (status = :status or (cast(:status as varchar) is null and status not in ('ARCHIVED', 'SOLD')))
                order by created_at desc
                """)
                .param("owner", ownerId)
                .param("status", status == null ? null : status.name())
                .query(ClothingItemRepositoryAdapter::map)
                .list();
    }

    @Override
    public void deleteById(UUID id) {
        jdbc.sql("delete from wardrobe_item where id = :id").param("id", id).update();
    }

    @Override
    public long countByOwner(UUID ownerId) {
        return jdbc.sql("select count(*) from wardrobe_item where owner_id = :owner and status not in ('RECOGNITION_FAILED', 'SOLD')")
                .param("owner", ownerId).query(Long.class).single();
    }

    @Override
    public List<ClothingItem> findByScan(UUID scanId) {
        return jdbc.sql("select * from wardrobe_item where scan_id = :scan order by created_at")
                .param("scan", scanId).query(ClothingItemRepositoryAdapter::map).list();
    }

    /** Nhãn ngắn, bỏ dấu phẩy trong từng giá trị để nối an toàn. */
    static String join(Collection<String> values) {
        return values == null ? "" : values.stream().map(v -> v.replace(",", " ").trim()).filter(v -> !v.isEmpty())
                .collect(Collectors.joining(","));
    }

    static List<String> split(String value) {
        return value == null || value.isBlank() ? List.of() : Arrays.stream(value.split(",")).map(String::trim).toList();
    }

    static ClothingItem map(ResultSet rs, int row) throws SQLException {
        String category = rs.getString("category");
        Set<Season> seasons = EnumSet.noneOf(Season.class);
        split(rs.getString("seasons")).forEach(s -> seasons.add(Season.valueOf(s)));
        ClothingAttributes attributes = new ClothingAttributes(
                category == null ? null : Category.valueOf(category),
                split(rs.getString("colors")),
                rs.getString("material"),
                seasons,
                new LinkedHashSet<>(split(rs.getString("style_tags"))),
                rs.getBigDecimal("purchase_price"), rs.getObject("purchase_date", java.time.LocalDate.class), rs.getString("brand"));
        Double confidence = rs.getObject("confidence", Double.class);
        return new ClothingItem(
                rs.getObject("id", UUID.class),
                rs.getObject("owner_id", UUID.class),
                rs.getString("image_key"),
                ItemStatus.valueOf(rs.getString("status")),
                attributes,
                rs.getObject("scan_id", UUID.class),
                confidence,
                rs.getTimestamp("created_at").toInstant());
    }
}
