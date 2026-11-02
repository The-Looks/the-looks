package vn.thelooks.outfit.infrastructure.persistence;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
import vn.thelooks.outfit.application.port.out.AffiliateClickRepository;
import vn.thelooks.outfit.domain.model.ProductOffer;

@Component
class AffiliateClickRepositoryAdapter implements AffiliateClickRepository {

    private final JdbcClient jdbc;

    AffiliateClickRepositoryAdapter(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void record(UUID ownerId, ProductOffer offer, String subId, Instant at) {
        String title = offer.title().length() > 300 ? offer.title().substring(0, 300) : offer.title();
        jdbc.sql("""
                insert into affiliate_click (owner_id, sub_id, source, product_id, title, created_at)
                values (:owner, :sub, :source, :product, :title, :at)
                """)
                .param("owner", ownerId)
                .param("sub", subId)
                .param("source", offer.source())
                .param("product", offer.id())
                .param("title", title)
                .param("at", Timestamp.from(at))
                .update();
    }
}
