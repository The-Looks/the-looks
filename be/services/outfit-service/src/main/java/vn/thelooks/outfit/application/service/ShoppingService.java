package vn.thelooks.outfit.application.service;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import vn.thelooks.outfit.application.port.out.AffiliateBlocklist;
import vn.thelooks.outfit.application.port.out.AffiliateClickRepository;
import vn.thelooks.outfit.application.port.out.PreferencesRepository;
import vn.thelooks.outfit.application.port.out.ProductCatalog;
import vn.thelooks.outfit.application.port.out.WardrobeReader;
import vn.thelooks.outfit.application.usecase.ShopForGapUseCase;
import vn.thelooks.outfit.domain.model.Occasion;
import vn.thelooks.outfit.domain.model.ProductOffer;
import vn.thelooks.outfit.domain.service.WardrobeGaps;

@Service
class ShoppingService implements ShopForGapUseCase {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ShoppingService.class);

    static final int PRODUCTS = 6;
    /** Tên màu tiếng Việt hay gặp trong tên sản phẩm, để xếp sản phẩm đúng màu người dùng thích lên trước. */
    static final Map<String, List<String>> COLOR_WORDS = Map.of(
            "white", List.of("trắng"), "black", List.of("đen"), "beige", List.of("be", "kem"), "gray", List.of("xám", "ghi"),
            "navy", List.of("navy", "xanh than"), "blue", List.of("xanh dương", "xanh"), "brown", List.of("nâu"),
            "pink", List.of("hồng"), "red", List.of("đỏ"), "green", List.of("xanh lá", "rêu"));

    private final WardrobeReader wardrobe;
    private final List<ProductCatalog> catalogs;
    private final AffiliateClickRepository clicks;
    private final PreferencesRepository preferences;
    private final AffiliateBlocklist blocklist;
    private final Clock clock;

    ShoppingService(WardrobeReader wardrobe, List<ProductCatalog> catalogs, AffiliateClickRepository clicks,
            PreferencesRepository preferences, AffiliateBlocklist blocklist, Clock clock) {
        this.wardrobe = wardrobe;
        this.catalogs = catalogs;
        this.clicks = clicks;
        this.preferences = preferences;
        this.blocklist = blocklist;
        this.clock = clock;
    }

    @Override
    public Optional<Suggestion> suggest(UUID ownerId, Occasion occasion) {
        var gap = WardrobeGaps.find(wardrobe.confirmedItems(ownerId), occasion, preferences.find(ownerId));
        if (gap.isEmpty()) {
            log.info("Gợi ý mua thêm ({}): tủ đồ không thiếu món nào", occasion);
            return Optional.empty();
        }
        List<List<ProductOffer>> found = catalogs.stream().map(c -> c.search(gap.get(), PRODUCTS * 3)).toList();
        // Để biết vì sao không có thẻ: từ khoá nào, mỗi nguồn (TikTok, datafeeds) trả bao nhiêu sản phẩm
        log.info("Gợi ý mua thêm ({}): thiếu {} '{}', sản phẩm theo nguồn {}", occasion, gap.get().category(),
                gap.get().keyword(), found.stream().map(List::size).toList());
        Suggestion suggestion = new Suggestion(gap.get(), withoutBlocked(byColor(interleave(found), gap.get().colors())));
        return suggestion.products().isEmpty() ? Optional.empty() : Optional.of(suggestion);
    }

    @Override
    public Optional<URI> open(UUID ownerId, String productId) {
        for (ProductCatalog catalog : catalogs) {
            Optional<ProductOffer> offer = catalog.find(productId)
                    .filter(o -> !blocklist.keys().contains(AffiliateBlocklist.key(o.source(), o.id())));
            if (offer.isPresent()) {
                String subId = subId(ownerId);
                clicks.record(ownerId, offer.get(), subId, clock.instant());
                return Optional.of(catalog.affiliateLink(offer.get(), subId));
            }
        }
        return Optional.empty();
    }

    /** Lấy lần lượt từ mỗi nguồn (TikTok, shop khác…) để không nguồn nào chiếm hết chỗ. */
    static List<ProductOffer> interleave(List<List<ProductOffer>> sources) {
        List<ProductOffer> out = new ArrayList<>();
        int longest = sources.stream().mapToInt(List::size).max().orElse(0);
        for (int i = 0; i < longest; i++) {
            for (List<ProductOffer> source : sources) {
                if (i < source.size()) {
                    out.add(source.get(i));
                }
            }
        }
        return out;
    }

    /** Sản phẩm có màu người dùng thích lên trước, giữ nguyên thứ tự trong mỗi nhóm. */
    static List<ProductOffer> byColor(List<ProductOffer> offers, Set<String> colors) {
        if (colors.isEmpty()) {
            return offers;
        }
        List<String> words = colors.stream().flatMap(c -> COLOR_WORDS.getOrDefault(c, List.of(c)).stream()).toList();
        return offers.stream().sorted(Comparator.comparing((ProductOffer o) -> !mentions(o.title(), words))).toList();
    }

    private static boolean mentions(String title, List<String> words) {
        String t = " " + title.toLowerCase(java.util.Locale.ROOT).replaceAll("[^\\p{L}\\p{N}]+", " ") + " ";
        return words.stream().anyMatch(w -> t.contains(" " + w + " "));
    }

    /** Lấy dư rồi bỏ sản phẩm admin đã chặn, để vẫn đủ {@link #PRODUCTS} món. */
    private List<ProductOffer> withoutBlocked(List<ProductOffer> offers) {
        Set<String> blocked = blocklist.keys();
        return offers.stream().filter(o -> !blocked.contains(AffiliateBlocklist.key(o.source(), o.id()))).limit(PRODUCTS).toList();
    }

    /** Mã ẩn danh gửi sang sàn: đối chiếu được đơn hàng với người dùng mà không lộ id thật. */
    static String subId(UUID ownerId) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(ownerId.toString().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash, 0, 8);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
