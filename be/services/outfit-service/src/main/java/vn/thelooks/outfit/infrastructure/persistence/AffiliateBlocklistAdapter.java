package vn.thelooks.outfit.infrastructure.persistence;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
import vn.thelooks.outfit.application.port.out.AffiliateBlocklist;

@Component
class AffiliateBlocklistAdapter implements AffiliateBlocklist {

    private final JdbcClient jdbc;

    AffiliateBlocklistAdapter(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public Set<String> keys() {
        return new HashSet<>(jdbc.sql("select source || ':' || product_id from affiliate_blocked_product").query(String.class).list());
    }

    @Override
    public List<Blocked> list() {
        return jdbc.sql("select * from affiliate_blocked_product order by blocked_at desc")
                .query((rs, n) -> new Blocked(rs.getString("source"), rs.getString("product_id"), rs.getString("title"),
                        rs.getObject("blocked_by", UUID.class), rs.getTimestamp("blocked_at").toInstant()))
                .list();
    }

    @Override
    public void block(String source, String productId, String title, UUID adminId, Instant at) {
        jdbc.sql("""
                insert into affiliate_blocked_product (source, product_id, title, blocked_by, blocked_at)
                values (:source, :product, :title, :admin, :at)
                on conflict (source, product_id) do nothing
                """)
                .param("source", source).param("product", productId)
                .param("title", title.length() > 300 ? title.substring(0, 300) : title)
                .param("admin", adminId).param("at", Timestamp.from(at))
                .update();
    }

    @Override
    public void unblock(String source, String productId) {
        jdbc.sql("delete from affiliate_blocked_product where source = :source and product_id = :product")
                .param("source", source).param("product", productId).update();
    }
}
