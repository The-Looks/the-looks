package vn.thelooks.wardrobe.infrastructure.persistence;

import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;
import vn.thelooks.wardrobe.application.port.out.WardrobeSearchRepository;
import vn.thelooks.wardrobe.application.usecase.SearchWardrobeQuery.Filter;
import vn.thelooks.wardrobe.application.usecase.SearchWardrobeQuery.Page;
import vn.thelooks.wardrobe.application.usecase.SearchWardrobeQuery.Sort;

@Component
class WardrobeSearchRepositoryAdapter implements WardrobeSearchRepository {
    private final JdbcClient jdbc;
    WardrobeSearchRepositoryAdapter(JdbcClient jdbc) { this.jdbc = jdbc; }

    public Page search(UUID ownerId, Filter filter, Map<UUID, Instant> lastWornAt) {
        StringBuilder where = new StringBuilder(" where i.owner_id = :owner");
        var params = new java.util.HashMap<String, Object>();
        params.put("owner", ownerId);
        if (filter.status() != null) { where.append(" and i.status = :status"); params.put("status", filter.status().name()); }
        if (filter.category() != null) { where.append(" and i.category = :category"); params.put("category", filter.category().name()); }
        if (filter.color() != null) { where.append(" and :color = any(string_to_array(lower(i.colors), ','))"); params.put("color", filter.color().toLowerCase(Locale.ROOT)); }
        if (filter.season() != null) { where.append(" and (i.seasons = '' or :season = any(string_to_array(i.seasons, ',')))"); params.put("season", filter.season().name()); }
        if (filter.style() != null) { where.append(" and :style = any(string_to_array(lower(i.style_tags), ','))"); params.put("style", filter.style().toLowerCase(Locale.ROOT)); }
        if (filter.q() != null) {
            where.append("""
                     and position(lower(:q) in lower(concat_ws(' ', i.category, i.colors, i.material, i.style_tags,
                         case i.category when 'TOP' then 'áo' when 'BOTTOM' then 'quần' when 'DRESS' then 'váy'
                         when 'OUTERWEAR' then 'áo khoác' when 'SHOES' then 'giày' when 'BAG' then 'túi' else 'phụ kiện' end))) > 0
                    """);
            params.put("q", filter.q());
        }
        long total = jdbc.sql("select count(*) from wardrobe_item i" + where).params(params).query(Long.class).single();
        String join = "", order = "i.created_at desc, i.id";
        if (filter.sort() == Sort.LEAST_RECENTLY_WORN) {
            // Aggregate history comes from outfit-service; filter, order and paginate in PostgreSQL.
            params.put("wear", JsonMapper.builder().build().writeValueAsString(lastWornAt.entrySet().stream()
                    .map(e -> Map.of("item_id", e.getKey().toString(), "last_worn_at", e.getValue().toString())).toList()));
            join = " left join jsonb_to_recordset(cast(:wear as jsonb)) as w(item_id uuid, last_worn_at timestamptz) on w.item_id = i.id";
            order = "w.last_worn_at asc nulls first, i.created_at asc, i.id";
        }
        params.put("limit", filter.size()); params.put("offset", (long) filter.page() * filter.size());
        var result = jdbc.sql("select i.* from wardrobe_item i" + join + where + " order by " + order + " limit :limit offset :offset")
                .params(params).query(ClothingItemRepositoryAdapter::map).list();
        return new Page(result, total, filter.page(), filter.size());
    }
}
