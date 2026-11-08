package vn.thelooks.wardrobe.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import vn.thelooks.wardrobe.application.usecase.SearchWardrobeQuery.Filter;
import vn.thelooks.wardrobe.application.usecase.SearchWardrobeQuery.Sort;
import vn.thelooks.wardrobe.domain.model.Category;
import vn.thelooks.wardrobe.domain.model.ClothingAttributes;
import vn.thelooks.wardrobe.domain.model.ClothingItem;
import vn.thelooks.wardrobe.domain.model.ItemStatus;
import vn.thelooks.wardrobe.domain.model.Season;

@EnabledIfEnvironmentVariable(named = "WARDROBE_TEST_DB_URL", matches = ".+")
class WardrobeSearchRepositoryTest {
    final UUID owner = UUID.randomUUID();
    final Instant now = Instant.parse("2026-11-06T00:00:00Z");
    JdbcClient admin;
    String schema;
    ClothingItemRepositoryAdapter items;
    WardrobeSearchRepositoryAdapter search;
    ClothingItem summerTop, winterTop, bottom, shoes, pending;

    @BeforeEach
    void setup() {
        String url = System.getenv("WARDROBE_TEST_DB_URL");
        admin = JdbcClient.create(new DriverManagerDataSource(url));
        schema = "search_test_" + UUID.randomUUID().toString().replace("-", "");
        admin.sql("create schema " + schema).update();
        var source = new DriverManagerDataSource(url + (url.contains("?") ? "&" : "?") + "currentSchema=" + schema);
        Flyway.configure().dataSource(source).schemas(schema).load().migrate();
        var jdbc = JdbcClient.create(source);
        items = new ClothingItemRepositoryAdapter(jdbc); search = new WardrobeSearchRepositoryAdapter(jdbc);
        summerTop = item(owner, Category.TOP, "white", "casual", Set.of(Season.SUMMER), 0, ItemStatus.CONFIRMED);
        winterTop = item(owner, Category.TOP, "white", "office", Set.of(Season.WINTER), 1, ItemStatus.CONFIRMED);
        bottom = item(owner, Category.BOTTOM, "offwhite", "smart-casual", Set.of(Season.SUMMER), 2, ItemStatus.CONFIRMED);
        shoes = item(owner, Category.SHOES, "white", "casual", Set.of(), 3, ItemStatus.CONFIRMED);
        pending = item(owner, Category.TOP, "black", "casual", Set.of(Season.SPRING), 4, ItemStatus.PENDING_REVIEW);
        item(UUID.randomUUID(), Category.TOP, "white", "casual", Set.of(Season.SUMMER), 5, ItemStatus.CONFIRMED);
    }
    @AfterEach
    void cleanup() { if (admin != null && schema != null) admin.sql("drop schema " + schema + " cascade").update(); }

    @Test
    void filtersEachFieldAndCombinesThemWithoutPartialTokenMatchesOrForeignItems() {
        assertThat(ids(new Filter(null, Category.TOP, null, null, null, null, null, 0, 100))).containsExactly(pending.id(), winterTop.id(), summerTop.id());
        assertThat(ids(new Filter(null, null, "WHITE", null, null, null, null, 0, 100))).containsExactly(shoes.id(), winterTop.id(), summerTop.id());
        assertThat(ids(new Filter(null, null, null, Season.SUMMER, null, null, null, 0, 100))).containsExactly(shoes.id(), bottom.id(), summerTop.id());
        assertThat(ids(new Filter(null, null, null, null, "CASUAL", null, null, 0, 100))).containsExactly(pending.id(), shoes.id(), summerTop.id());
        assertThat(ids(new Filter(ItemStatus.PENDING_REVIEW, null, null, null, null, null, null, 0, 100))).containsExactly(pending.id());
        assertThat(ids(new Filter(ItemStatus.CONFIRMED, Category.TOP, "white", Season.SUMMER, "casual", null, null, 0, 100))).containsExactly(summerTop.id());
        assertThat(ids(new Filter(null, null, null, null, null, "áo", null, 0, 100))).containsExactly(pending.id(), winterTop.id(), summerTop.id());
        assertThat(ids(new Filter(null, null, null, null, null, "%_';--", null, 0, 100))).isEmpty();
    }
    @Test
    void paginatesMoreThanFiftyItemsWithStableTiesAndCorrectTotals() {
        for (int i = 0; i < 55; i++) item(owner, Category.BAG, "red", "casual", Set.of(), 0, ItemStatus.CONFIRMED);
        var first = search.search(owner, filter(0, 24), Map.of());
        var second = search.search(owner, filter(1, 24), Map.of());
        var third = search.search(owner, filter(2, 24), Map.of());
        assertThat(first.total()).isEqualTo(60);
        assertThat(first.items()).hasSize(24); assertThat(second.items()).hasSize(24); assertThat(third.items()).hasSize(12);
        var all = java.util.stream.Stream.of(first, second, third).flatMap(page -> page.items().stream()).map(ClothingItem::id).toList();
        assertThat(all).doesNotHaveDuplicates().hasSize(60);
        assertThat(ids(filter(0, 24))).containsExactlyElementsOf(first.items().stream().map(ClothingItem::id).toList());
        var beyond = search.search(owner, filter(20, 24), Map.of());
        assertThat(beyond.items()).isEmpty(); assertThat(beyond.total()).isEqualTo(60);
    }
    @Test
    void ordersNeverWornThenOldestWearBeforeApplyingPagination() {
        Map<UUID, Instant> history = Map.of(summerTop.id(), now.minusSeconds(10), winterTop.id(), now.minusSeconds(100), shoes.id(), now.minusSeconds(50));
        var f = new Filter(ItemStatus.CONFIRMED, null, null, null, null, null, Sort.LEAST_RECENTLY_WORN, 0, 2);
        var first = search.search(owner, f, history);
        assertThat(first.items()).extracting(ClothingItem::id).containsExactly(bottom.id(), winterTop.id());
        var second = search.search(owner, new Filter(f.status(), null, null, null, null, null, f.sort(), 1, 2), history);
        assertThat(second.items()).extracting(ClothingItem::id).containsExactly(shoes.id(), summerTop.id());
        assertThat(first.total()).isEqualTo(4);
    }
    @Test
    void hidesArchivedAndSoldItemsUnlessAskedForThem() {
        var archived = item(owner, Category.TOP, "white", "casual", Set.of(), 9, ItemStatus.ARCHIVED);
        var sold = item(owner, Category.TOP, "white", "casual", Set.of(), 10, ItemStatus.SOLD);
        assertThat(ids(filter(0, 100))).doesNotContain(archived.id(), sold.id());
        assertThat(ids(new Filter(ItemStatus.ARCHIVED, null, null, null, null, null, null, 0, 100))).containsExactly(archived.id());
        assertThat(items.findByOwner(owner, null)).extracting(ClothingItem::id).doesNotContain(archived.id(), sold.id());
        assertThat(items.findByOwner(owner, ItemStatus.SOLD)).extracting(ClothingItem::id).containsExactly(sold.id());
        assertThat(items.countByOwner(owner)).isEqualTo(6); // 4 đã xác nhận + 1 chờ + 1 cất đi; đã bán không chiếm chỗ
    }
    private Filter filter(int page, int size) { return new Filter(null, null, null, null, null, null, Sort.NEWEST, page, size); }
    private List<UUID> ids(Filter filter) { return search.search(owner, filter, Map.of()).items().stream().map(ClothingItem::id).toList(); }
    private ClothingItem item(UUID ownerId, Category category, String color, String style, Set<Season> seasons, int time, ItemStatus status) {
        return items.save(new ClothingItem(UUID.randomUUID(), ownerId, "image.jpg", status,
                new ClothingAttributes(category, List.of(color), "cotton", seasons, Set.of(style)), null, null, now.plusSeconds(time)));
    }
}
