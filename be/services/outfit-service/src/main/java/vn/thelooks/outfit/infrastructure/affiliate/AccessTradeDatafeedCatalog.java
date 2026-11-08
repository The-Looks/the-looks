package vn.thelooks.outfit.infrastructure.affiliate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import vn.thelooks.outfit.application.port.out.ProductCatalog;
import vn.thelooks.outfit.domain.model.ProductOffer;
import vn.thelooks.outfit.domain.model.StylePreferences.Gender;
import vn.thelooks.outfit.domain.model.WardrobeGap;

/**
 * Sản phẩm từ datafeeds của các chiến dịch AccessTrade đã được duyệt (shop thời trang, sàn…), ngoài TikTok Shop.
 * API datafeeds không tìm theo từ khoá, nên tải sẵn tối đa {@link #MAX_PAGES} trang mỗi chiến dịch, làm mới mỗi
 * {@link #REFRESH}, rồi lọc theo tên sản phẩm. Lần tải chạy nền: lượt gọi đầu tiên có thể chưa có sản phẩm.
 * Danh sách chiến dịch: ACCESSTRADE_CAMPAIGNS (merchant, cách nhau dấu phẩy) hoặc tự lấy mọi chiến dịch đã duyệt.
 */
// ponytail: giữ trong RAM, sàn lớn chỉ lấy vài trang đầu; chuyển sang bảng DB + job đêm nếu cần cả catalog
@Component
class AccessTradeDatafeedCatalog implements ProductCatalog {

    private static final Logger log = LoggerFactory.getLogger(AccessTradeDatafeedCatalog.class);
    static final String SOURCE_PREFIX = "AT_";
    static final Duration REFRESH = Duration.ofHours(12);
    static final int PAGE_SIZE = 200;
    static final int MAX_PAGES = 5;

    record Feed(ProductOffer offer, String affLink, Set<String> words) {
    }

    private final RestClient http;
    private final String apiKey;
    private final List<String> configured;
    private final Clock clock;
    private final AtomicBoolean loading = new AtomicBoolean();
    private volatile List<Feed> feeds = List.of();
    private volatile Map<String, Feed> byId = Map.of();
    private volatile Instant loadedAt = Instant.EPOCH;

    AccessTradeDatafeedCatalog(
            @Value("${thelooks.affiliate.accesstrade-url:https://api.accesstrade.vn}") String url,
            @Value("${thelooks.affiliate.accesstrade-api-key:}") String apiKey,
            @Value("${thelooks.affiliate.accesstrade-campaigns:}") String campaigns,
            Clock clock) {
        var requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(3));
        requestFactory.setReadTimeout(Duration.ofSeconds(20));
        this.http = RestClient.builder().baseUrl(url).requestFactory(requestFactory)
                .defaultHeader("Authorization", "Token " + apiKey).build();
        this.apiKey = apiKey;
        this.configured = Arrays.stream(campaigns.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
        this.clock = clock;
    }

    @Override
    public List<ProductOffer> search(WardrobeGap gap, int limit) {
        if (apiKey.isBlank()) {
            return List.of();
        }
        if (clock.instant().isAfter(loadedAt.plus(REFRESH)) && loading.compareAndSet(false, true)) {
            Thread.ofVirtual().name("accesstrade-datafeeds").start(() -> {
                try {
                    load();
                } finally {
                    loading.set(false);
                }
            });
        }
        return match(feeds, gap, limit);
    }

    /** Mọi từ của từ khoá phải có trong tên; không có món nào thì nới về 2 từ đầu (ví dụ "ao thun oversize" → "ao thun"). */
    static List<ProductOffer> match(List<Feed> feeds, WardrobeGap gap, int limit) {
        List<String> keyword = List.of(words(gap.keyword()).toArray(String[]::new));
        List<ProductOffer> found = filter(feeds, Set.copyOf(keyword), gap, limit);
        if (found.isEmpty() && keyword.size() > 2) {
            found = filter(feeds, Set.copyOf(keyword.subList(0, 2)), gap, limit);
        }
        return found;
    }

    private static List<ProductOffer> filter(List<Feed> feeds, Set<String> keyword, WardrobeGap gap, int limit) {
        return feeds.stream()
                .filter(f -> f.words().containsAll(keyword) && fitsGender(f.offer().title(), gap.gender())
                        && (gap.budget() == null || gap.budget().fits(f.offer().minPriceVnd())))
                .map(Feed::offer).limit(limit).toList();
    }

    /** Tên ghi "nam" / "nữ": người dùng nữ không nhận đồ chỉ dành cho nam và ngược lại. */
    static boolean fitsGender(String title, Gender gender) {
        if (gender == null || gender == Gender.OTHER) {
            return true;
        }
        Set<String> w = words(title);
        boolean male = w.contains("nam") && !title.toLowerCase(Locale.ROOT).contains("việt nam");
        boolean female = title.toLowerCase(Locale.ROOT).contains("nữ");
        return gender == Gender.MALE ? !(female && !male) : !(male && !female);
    }

    /** Chữ thường, bỏ dấu, tách từ: "Áo Sơ Mi Nữ" → {ao, so, mi, nu}. */
    static Set<String> words(String text) {
        String plain = Normalizer.normalize(text.toLowerCase(Locale.ROOT).replace('đ', 'd'), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return Arrays.stream(plain.split("[^a-z0-9]+")).filter(s -> !s.isEmpty()).collect(Collectors.toCollection(java.util.LinkedHashSet::new));
    }

    @Override
    public Optional<ProductOffer> find(String productId) {
        return Optional.ofNullable(byId.get(productId)).map(Feed::offer);
    }

    @Override
    public URI affiliateLink(ProductOffer offer, String subId) {
        Feed feed = byId.get(offer.id());
        if (feed == null || feed.affLink() == null) {
            return offer.productUrl();
        }
        String link = feed.affLink();
        return URI.create(link + (link.contains("?") ? "&" : "?") + "sub1=" + URLEncoder.encode(subId, StandardCharsets.UTF_8));
    }

    void load() {
        try {
            List<String> campaigns = configured.isEmpty() ? approvedCampaigns() : configured;
            List<Feed> all = new ArrayList<>();
            for (String campaign : campaigns) {
                all.addAll(fetchCampaign(campaign));
            }
            Map<String, Feed> unique = all.stream().collect(Collectors.toMap(f -> f.offer().id(), Function.identity(), (a, b) -> a,
                    java.util.LinkedHashMap::new));
            feeds = List.copyOf(unique.values());
            byId = Map.copyOf(unique);
            loadedAt = clock.instant();
            log.info("AccessTrade datafeeds: {} sản phẩm từ {} chiến dịch {}", feeds.size(), campaigns.size(), campaigns);
        } catch (RestClientException e) {
            log.warn("Không tải được datafeeds AccessTrade: {}", e.getMessage());
            loadedAt = clock.instant().minus(REFRESH).plus(Duration.ofMinutes(30)); // thử lại sau 30 phút
        }
    }

    private List<String> approvedCampaigns() {
        CampaignResponse body = http.get().uri("/v1/campaigns?approval=successful&limit=100").retrieve().body(CampaignResponse.class);
        if (body == null || body.data() == null) {
            return List.of();
        }
        return body.data().stream()
                .filter(c -> c.merchant() != null && (c.status() == null || c.status() == 1))
                .map(Campaign::merchant)
                .filter(m -> !m.toLowerCase(Locale.ROOT).contains("tiktok")) // TikTok Shop đã có nguồn riêng
                .distinct().toList();
    }

    private List<Feed> fetchCampaign(String campaign) {
        List<Feed> found = new ArrayList<>();
        for (int page = 1; page <= MAX_PAGES; page++) {
            int p = page;
            DatafeedResponse body;
            try {
                body = http.get().uri(b -> b.path("/v1/datafeeds").queryParam("campaign", campaign)
                        .queryParam("limit", PAGE_SIZE).queryParam("page", p).build()).retrieve().body(DatafeedResponse.class);
            } catch (RestClientException e) {
                log.warn("Datafeeds {} trang {} lỗi: {}", campaign, p, e.getMessage());
                break; // chiến dịch không có datafeeds: bỏ qua, chạy tiếp chiến dịch khác
            }
            if (body == null || body.data() == null || body.data().isEmpty()) {
                break;
            }
            body.data().stream().map(i -> toFeed(i, campaign)).flatMap(Optional::stream).forEach(found::add);
            if (body.data().size() < PAGE_SIZE) {
                break;
            }
        }
        return found;
    }

    static Optional<Feed> toFeed(Item i, String campaign) {
        if (i.productId() == null || i.name() == null || i.url() == null || i.price() == null) {
            return Optional.empty();
        }
        try {
            long price = Math.round(i.price());
            long sale = i.discount() != null && i.discount() > 0 && i.discount() < i.price() ? Math.round(i.discount()) : price;
            String shop = i.merchant() == null ? campaign : i.merchant();
            var offer = new ProductOffer(i.productId(), i.name(), i.image() == null || i.image().isBlank() ? null : URI.create(i.image()),
                    sale, sale, shop, 0, URI.create(i.url()), SOURCE_PREFIX + campaign.toUpperCase(Locale.ROOT));
            return Optional.of(new Feed(offer, i.affLink(), words(i.name())));
        } catch (IllegalArgumentException e) { // link ảnh / sản phẩm không đọc được
            return Optional.empty();
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record CampaignResponse(List<Campaign> data) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Campaign(String merchant, String name, Integer status) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record DatafeedResponse(List<Item> data, Long total) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Item(
            @JsonProperty("product_id") String productId,
            String name,
            String image,
            String url,
            @JsonProperty("aff_link") String affLink,
            Double price,
            Double discount,
            String merchant) {
    }
}
