package vn.thelooks.outfit.infrastructure.affiliate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.net.URI;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import vn.thelooks.outfit.application.port.out.ProductCatalog;
import vn.thelooks.outfit.domain.model.ProductOffer;
import vn.thelooks.outfit.domain.model.WardrobeGap;

/**
 * TikTok Shop qua AccessTrade (chiến dịch "TIKTOK SHOP CPS" phải được duyệt).
 * Tìm theo từ khoá khá lỏng ("so mi" ra cả lông mi giả) nên lọc lại theo danh mục TikTok của sản phẩm.
 * Kết quả tìm cache 6 giờ; chưa có ACCESSTRADE_API_KEY thì tắt (trả rỗng, không gọi mạng).
 */
// ponytail: cache trong RAM, đủ cho 1 máy; nhiều máy thì sản phẩm tìm ở máy này chưa mở link được ở máy kia
@Component
class AccessTradeTikTokCatalog implements ProductCatalog {

    private static final Logger log = LoggerFactory.getLogger(AccessTradeTikTokCatalog.class);
    static final String SOURCE = "TIKTOK_SHOP";
    static final Duration CACHE_TTL = Duration.ofHours(6);
    static final int MAX_REMEMBERED = 5_000;
    /** Từ trong tên danh mục TikTok (tiếng Anh) chấp nhận cho từng loại đồ. */
    static final Map<String, Set<String>> CATEGORY_WORDS = Map.of(
            "TOP", Set.of("t-shirt", "shirts", "polo", "blouse", "tops", "tanks", "hoodies", "sweatshirts"),
            "BOTTOM", Set.of("jeans", "pants", "trousers", "shorts", "skirts", "leggings"),
            "SHOES", Set.of("trainers", "shoes", "sneakers", "sandals", "flip flops", "boots", "slip-ons", "loafers", "heels"));

    private record Cached(Instant at, List<ProductOffer> offers) {
    }

    private final RestClient http;
    private final String apiKey;
    private final Clock clock;
    private final Map<String, Cached> searches = new ConcurrentHashMap<>();
    private final Map<String, ProductOffer> offers = new ConcurrentHashMap<>();

    AccessTradeTikTokCatalog(
            @Value("${thelooks.affiliate.accesstrade-url:https://api.accesstrade.vn}") String url,
            @Value("${thelooks.affiliate.accesstrade-api-key:}") String apiKey,
            Clock clock) {
        var requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(3));
        requestFactory.setReadTimeout(Duration.ofSeconds(8));
        this.http = RestClient.builder().baseUrl(url).requestFactory(requestFactory)
                .defaultHeader("Authorization", "Token " + apiKey).build();
        this.apiKey = apiKey;
        this.clock = clock;
    }

    @Override
    public List<ProductOffer> search(WardrobeGap gap, int limit) {
        if (apiKey.isBlank()) {
            return List.of();
        }
        Instant now = clock.instant();
        Cached hit = searches.get(gap.keyword());
        if (hit == null || now.isAfter(hit.at().plus(CACHE_TTL))) {
            List<ProductOffer> found = fetch(gap);
            if (found == null) {
                return hit == null ? List.of() : hit.offers().stream().limit(limit).toList(); // lỗi mạng: dùng tạm kết quả cũ
            }
            hit = new Cached(now, found);
            searches.put(gap.keyword(), hit);
            if (offers.size() > MAX_REMEMBERED) {
                offers.clear();
            }
            found.forEach(o -> offers.put(o.id(), o));
        }
        return hit.offers().stream().limit(limit).toList();
    }

    @Override
    public Optional<ProductOffer> find(String productId) {
        return Optional.ofNullable(offers.get(productId));
    }

    @Override
    public URI affiliateLink(ProductOffer offer, String subId) {
        try {
            LinkResponse response = http.post().uri("/v1/tiktokshop_product_feeds/create_link")
                    .body(Map.of("product_id", offer.id(), "product_url", offer.productUrl().toString(), "sub1", subId))
                    .retrieve().body(LinkResponse.class);
            if (response != null && response.data() != null && notBlank(response.data().affUrl())) {
                return URI.create(response.data().affUrl());
            }
            log.warn("AccessTrade không tạo được link cho sản phẩm {}: {}", offer.id(), response);
        } catch (RestClientException | IllegalArgumentException e) {
            log.warn("AccessTrade không tạo được link cho sản phẩm {}: {}", offer.id(), e.getMessage());
        }
        return offer.productUrl(); // vẫn cho người dùng xem sản phẩm, chỉ là lượt này không tính hoa hồng
    }

    /** null khi lỗi mạng (khác với tìm được 0 sản phẩm). */
    private List<ProductOffer> fetch(WardrobeGap gap) {
        try {
            FeedResponse body = http.get()
                    .uri(b -> b.path("/v1/tiktokshop_product_feeds")
                            .queryParam("title_keywords", gap.keyword())
                            .queryParam("sort_field", "units_sold")
                            .queryParam("sort_order", "DESC")
                            .queryParam("limit", 20)
                            .build())
                    .retrieve().body(FeedResponse.class);
            if (body == null || body.data() == null || body.data().products() == null) {
                return List.of();
            }
            Set<String> words = CATEGORY_WORDS.getOrDefault(gap.category(), Set.of());
            return body.data().products().stream()
                    .filter(p -> !Boolean.FALSE.equals(p.hasInventory()) && p.matches(words))
                    .map(AccessTradeTikTokCatalog::toOffer)
                    .flatMap(Optional::stream)
                    .toList();
        } catch (RestClientException e) {
            log.warn("Không tìm được sản phẩm TikTok Shop ({}): {}", gap.keyword(), e.getMessage());
            return null;
        }
    }

    static Optional<ProductOffer> toOffer(Product p) {
        Price price = p.salesPrice() != null && notBlank(p.salesPrice().min()) ? p.salesPrice() : p.originalPrice();
        if (!notBlank(p.id()) || !notBlank(p.title()) || !notBlank(p.detailLink()) || price == null || !notBlank(price.min())) {
            return Optional.empty();
        }
        try {
            long min = Math.round(Double.parseDouble(price.min()));
            long max = notBlank(price.max()) ? Math.round(Double.parseDouble(price.max())) : min;
            return Optional.of(new ProductOffer(p.id(), p.title(),
                    notBlank(p.mainImageUrl()) ? URI.create(p.mainImageUrl()) : null,
                    min, max, p.shop() == null ? "" : p.shop().name(),
                    p.unitsSold() == null ? 0 : p.unitsSold(), URI.create(p.detailLink()), SOURCE));
        } catch (IllegalArgumentException e) { // giá hoặc link không đọc được: bỏ sản phẩm này
            return Optional.empty();
        }
    }

    private static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record FeedResponse(FeedData data) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record FeedData(List<Product> products) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Product(
            String id,
            String title,
            @JsonProperty("main_image_url") String mainImageUrl,
            @JsonProperty("detail_link") String detailLink,
            @JsonProperty("has_inventory") Boolean hasInventory,
            @JsonProperty("units_sold") Long unitsSold,
            @JsonProperty("original_price") Price originalPrice,
            @JsonProperty("sales_price") Price salesPrice,
            Shop shop,
            @JsonProperty("category_chains") List<CategoryNode> categoryChains) {

        /** Chỉ xét danh mục lá: "Shoes > Shoe Care" (keo dán giày) không được tính là giày. */
        boolean matches(Set<String> words) {
            if (categoryChains == null || categoryChains.isEmpty() || categoryChains.getLast().localName() == null) {
                return false;
            }
            String leaf = categoryChains.getLast().localName().toLowerCase(Locale.ROOT);
            return words.stream().anyMatch(leaf::contains);
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Price(@JsonProperty("minimum_amount") String min, @JsonProperty("maximum_amount") String max) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Shop(String name) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record CategoryNode(@JsonProperty("local_name") String localName) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record LinkResponse(LinkData data, Boolean status, String message) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record LinkData(@JsonProperty("aff_url") String affUrl, @JsonProperty("aff_short_url") String affShortUrl) {
    }
}
