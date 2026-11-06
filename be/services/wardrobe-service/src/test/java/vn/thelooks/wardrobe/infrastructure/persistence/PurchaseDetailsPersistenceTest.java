package vn.thelooks.wardrobe.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import vn.thelooks.wardrobe.domain.model.Category;
import vn.thelooks.wardrobe.domain.model.ClothingAttributes;
import vn.thelooks.wardrobe.domain.model.ClothingItem;
import vn.thelooks.wardrobe.domain.model.ItemStatus;

/** Run against a disposable PostgreSQL database with WARDROBE_TEST_DB_URL. Uses an isolated schema. */
@EnabledIfEnvironmentVariable(named = "WARDROBE_TEST_DB_URL", matches = ".+")
class PurchaseDetailsPersistenceTest {
    @Test
    void migratesExistingItemsAndRoundTripsPurchaseDetailsOnInsertUpdateAndClear() {
        String url = System.getenv("WARDROBE_TEST_DB_URL");
        var admin = JdbcClient.create(new DriverManagerDataSource(url));
        String schema = "wardrobe_test_" + UUID.randomUUID().toString().replace("-", "");
        admin.sql("create schema " + schema).update();
        try {
            var source = new DriverManagerDataSource(url + (url.contains("?") ? "&" : "?") + "currentSchema=" + schema);
            Flyway.configure().dataSource(source).schemas(schema).target("2").load().migrate();
            var jdbc = JdbcClient.create(source);
            UUID old = UUID.randomUUID(), owner = UUID.randomUUID();
            jdbc.sql("insert into wardrobe_item(id, owner_id, image_key, status, created_at) values(:id, :owner, 'old.jpg', 'CONFIRMED', now())")
                    .param("id", old).param("owner", owner).update();
            Flyway.configure().dataSource(source).schemas(schema).load().migrate();
            var repo = new ClothingItemRepositoryAdapter(jdbc);
            assertThat(repo.findById(old).orElseThrow().attributes().purchasePrice()).isNull();
            assertThat(repo.findById(old).orElseThrow().attributes().brand()).isNull();

            var attrs = new ClothingAttributes(Category.TOP, List.of("white"), "cotton", Set.of(), Set.of(),
                    new BigDecimal("300000.50"), LocalDate.of(2026, 11, 6), "Uniqlo");
            var item = new ClothingItem(UUID.randomUUID(), owner, "new.jpg", ItemStatus.CONFIRMED, attrs, null, null, Instant.now());
            repo.save(item);
            var saved = repo.findById(item.id()).orElseThrow();
            assertThat(saved.attributes()).isEqualTo(attrs);
            assertThat(saved.confidence()).isNull();
            var gifted = new ClothingAttributes(Category.TOP, List.of(), null, Set.of(), Set.of(), BigDecimal.ZERO, null, "Gift");
            repo.save(item.withStatus(ItemStatus.CONFIRMED, gifted));
            assertThat(repo.findById(item.id()).orElseThrow().attributes().purchasePrice()).isEqualByComparingTo("0");
            var cleared = new ClothingAttributes(Category.TOP, List.of(), null, Set.of(), Set.of());
            repo.save(item.withStatus(ItemStatus.CONFIRMED, cleared));
            assertThat(repo.findById(item.id()).orElseThrow().attributes()).isEqualTo(cleared);
            assertThatThrownBy(() -> jdbc.sql("update wardrobe_item set purchase_price = -1 where id = :id").param("id", item.id()).update())
                    .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
        } finally {
            admin.sql("drop schema " + schema + " cascade").update();
        }
    }
}
