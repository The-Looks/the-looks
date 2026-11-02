package vn.thelooks.outfit.infrastructure.affiliate;

import static org.assertj.core.api.Assertions.assertThat;

import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import vn.thelooks.outfit.domain.model.WardrobeGap;

/** Chạy với một server HTTP giả trả đúng dạng JSON của AccessTrade. */
class AccessTradeTikTokCatalogTest {

    static final String FEED = """
            {"data": {"next_page_token": "x", "products": [
              {"id": "1", "title": "Giày sneaker trắng", "main_image_url": "https://img/1.webp",
               "detail_link": "https://shop.tiktok.com/view/product/1?region=VN", "has_inventory": true, "units_sold": 5000,
               "original_price": {"currency": "VND", "minimum_amount": "300000", "maximum_amount": "350000"},
               "sales_price": {"currency": "", "minimum_amount": "", "maximum_amount": ""},
               "shop": {"name": "Shop A"}, "category_chains": [{"local_name": "Shoes"}, {"local_name": "Casual Trainers"}]},
              {"id": "2", "title": "Keo dán giày", "detail_link": "https://shop.tiktok.com/view/product/2", "has_inventory": true,
               "original_price": {"minimum_amount": "90000", "maximum_amount": "90000"},
               "category_chains": [{"local_name": "Shoes"}, {"local_name": "Cleaning & Care"}]},
              {"id": "3", "title": "Sneaker hết hàng", "detail_link": "https://shop.tiktok.com/view/product/3", "has_inventory": false,
               "original_price": {"minimum_amount": "200000", "maximum_amount": "200000"},
               "category_chains": [{"local_name": "Casual Trainers"}]}
            ]}}
            """;

    final AtomicInteger feedCalls = new AtomicInteger();
    String lastAuth;
    String lastLinkBody;
    HttpServer server;

    AccessTradeTikTokCatalog start(String key) throws Exception {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/v1/tiktokshop_product_feeds/create_link", ex -> {
            lastLinkBody = new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            reply(ex, "{\"data\": {\"aff_url\": \"https://go.isclix.com/deep_link/abc?sub1=x\", \"aff_short_url\": \"\"}, \"status\": true}");
        });
        server.createContext("/v1/tiktokshop_product_feeds", ex -> {
            feedCalls.incrementAndGet();
            lastAuth = ex.getRequestHeaders().getFirst("Authorization");
            reply(ex, FEED);
        });
        server.start();
        return new AccessTradeTikTokCatalog("http://127.0.0.1:" + server.getAddress().getPort(), key, Clock.systemUTC());
    }

    static void reply(com.sun.net.httpserver.HttpExchange ex, String json) throws java.io.IOException {
        byte[] body = json.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().add("Content-Type", "application/json");
        ex.sendResponseHeaders(200, body.length);
        ex.getResponseBody().write(body);
        ex.close();
    }

    @AfterEach
    void stop() {
        if (server != null) server.stop(0);
    }

    final WardrobeGap shoes = new WardrobeGap("SHOES", "sneaker", "giày");

    @Test
    void keepsOnlyInStockProductsOfTheRightCategoryAndCachesTheSearch() throws Exception {
        var catalog = start("secret");
        var offers = catalog.search(shoes, 3);
        assertThat(offers).extracting(o -> o.id()).containsExactly("1");
        assertThat(offers.getFirst().minPriceVnd()).isEqualTo(300_000);
        assertThat(offers.getFirst().maxPriceVnd()).isEqualTo(350_000);
        assertThat(lastAuth).isEqualTo("Token secret");

        catalog.search(shoes, 3);
        assertThat(feedCalls).hasValue(1);
        assertThat(catalog.find("1")).isPresent();
        assertThat(catalog.find("999")).isEmpty();
    }

    @Test
    void createsAffiliateLinkWithSubId() throws Exception {
        var catalog = start("secret");
        var offer = catalog.search(shoes, 3).getFirst();
        assertThat(catalog.affiliateLink(offer, "ab12")).isEqualTo(URI.create("https://go.isclix.com/deep_link/abc?sub1=x"));
        assertThat(lastLinkBody).contains("\"product_id\":\"1\"").contains("\"sub1\":\"ab12\"");
    }

    @Test
    void withoutApiKeyTheFeatureIsOff() throws Exception {
        var catalog = start("");
        assertThat(catalog.search(shoes, 3)).isEmpty();
        assertThat(feedCalls).hasValue(0);
    }
}
