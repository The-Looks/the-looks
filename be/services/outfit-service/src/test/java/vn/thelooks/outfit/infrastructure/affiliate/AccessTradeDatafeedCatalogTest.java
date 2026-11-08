package vn.thelooks.outfit.infrastructure.affiliate;

import static org.assertj.core.api.Assertions.assertThat;

import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.time.Clock;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import vn.thelooks.outfit.domain.model.StylePreferences.Gender;
import vn.thelooks.outfit.domain.model.WardrobeGap;

/** Server HTTP giả trả đúng dạng JSON campaigns / datafeeds của AccessTrade. */
class AccessTradeDatafeedCatalogTest {

    static final String CAMPAIGNS = """
            {"data": [
              {"merchant": "coolmate", "name": "Coolmate", "approval": "successful", "status": 1},
              {"merchant": "tiktokshop", "name": "TikTok Shop CPS", "approval": "successful", "status": 1},
              {"merchant": "nofeed", "name": "Không có datafeeds", "approval": "successful", "status": 1}
            ]}""";
    static final String FEED = """
            {"total": 4, "data": [
              {"product_id": "c1", "name": "Áo Sơ Mi Nam Dài Tay Trắng", "image": "https://img/c1.jpg", "url": "https://coolmate.me/c1",
               "aff_link": "https://go.isclix.com/deep_link/1?url=https%3A%2F%2Fcoolmate.me%2Fc1", "price": 399000, "discount": 299000, "merchant": "coolmate"},
              {"product_id": "c2", "name": "Áo sơ mi nữ công sở", "url": "https://coolmate.me/c2", "price": 250000, "discount": 0},
              {"product_id": "c3", "name": "Áo thun nam basic", "url": "https://coolmate.me/c3", "price": 150000},
              {"product_id": "c4", "name": "Quần jean", "url": null, "price": 200000}
            ]}""";

    final List<String> requested = new ArrayList<>();
    HttpServer server;

    AccessTradeDatafeedCatalog start(String campaigns) throws Exception {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/v1/campaigns", ex -> AccessTradeTikTokCatalogTest.reply(ex, CAMPAIGNS));
        server.createContext("/v1/datafeeds", ex -> {
            String query = ex.getRequestURI().getQuery();
            requested.add(query);
            if (query.contains("campaign=nofeed")) {
                ex.sendResponseHeaders(404, -1);
                ex.close();
            } else {
                AccessTradeTikTokCatalogTest.reply(ex, FEED);
            }
        });
        server.start();
        return new AccessTradeDatafeedCatalog("http://127.0.0.1:" + server.getAddress().getPort(), "secret", campaigns, Clock.systemUTC());
    }

    @AfterEach
    void stop() {
        if (server != null) server.stop(0);
    }

    @Test
    void readsEveryApprovedCampaignExceptTikTokAndSkipsCampaignsWithoutFeeds() throws Exception {
        var catalog = start("");
        catalog.load();
        assertThat(requested).anyMatch(q -> q.contains("campaign=coolmate")).noneMatch(q -> q.contains("tiktok"));
        var shirt = new WardrobeGap("TOP", "so mi nam", "áo đi làm", Gender.MALE, null, Set.of());
        var found = catalog.search(shirt, 6);
        assertThat(found).extracting(o -> o.id()).containsExactly("c1"); // nữ công sở bị loại, thiếu link bị bỏ
        assertThat(found.getFirst().minPriceVnd()).isEqualTo(299000); // giá đang bán
        assertThat(found.getFirst().source()).isEqualTo("AT_COOLMATE");
        assertThat(catalog.affiliateLink(found.getFirst(), "abc").toString()).endsWith("&sub1=abc");
    }

    @Test
    void relaxesALongKeywordWhenNothingMatchesExactly() throws Exception {
        var catalog = start("coolmate");
        catalog.load();
        var gap = new WardrobeGap("TOP", "ao thun oversize nam", "áo đi chơi", Gender.MALE, null, Set.of());
        assertThat(catalog.search(gap, 6)).extracting(o -> o.id()).containsExactly("c3");
    }

    @Test
    void normalisesVietnameseText() {
        assertThat(AccessTradeDatafeedCatalog.words("Áo Sơ-Mi Đen")).containsExactly("ao", "so", "mi", "den");
        assertThat(AccessTradeDatafeedCatalog.fitsGender("Áo thun Việt Nam cho nữ", Gender.FEMALE)).isTrue();
    }
}
