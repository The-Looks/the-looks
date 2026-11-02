package vn.thelooks.outfit.application.service;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import vn.thelooks.outfit.application.port.out.AffiliateClickRepository;
import vn.thelooks.outfit.application.port.out.ProductCatalog;
import vn.thelooks.outfit.application.port.out.WardrobeReader;
import vn.thelooks.outfit.application.usecase.ShopForGapUseCase;
import vn.thelooks.outfit.domain.model.Occasion;
import vn.thelooks.outfit.domain.model.ProductOffer;
import vn.thelooks.outfit.domain.service.WardrobeGaps;

@Service
class ShoppingService implements ShopForGapUseCase {

    static final int PRODUCTS = 3;

    private final WardrobeReader wardrobe;
    private final ProductCatalog catalog;
    private final AffiliateClickRepository clicks;
    private final Clock clock;

    ShoppingService(WardrobeReader wardrobe, ProductCatalog catalog, AffiliateClickRepository clicks, Clock clock) {
        this.wardrobe = wardrobe;
        this.catalog = catalog;
        this.clicks = clicks;
        this.clock = clock;
    }

    @Override
    public Optional<Suggestion> suggest(UUID ownerId, Occasion occasion) {
        return WardrobeGaps.find(wardrobe.confirmedItems(ownerId), occasion)
                .map(gap -> new Suggestion(gap, catalog.search(gap, PRODUCTS)))
                .filter(s -> !s.products().isEmpty());
    }

    @Override
    public Optional<URI> open(UUID ownerId, String productId) {
        Optional<ProductOffer> offer = catalog.find(productId);
        if (offer.isEmpty()) {
            return Optional.empty();
        }
        String subId = subId(ownerId);
        clicks.record(ownerId, offer.get(), subId, clock.instant());
        return Optional.of(catalog.affiliateLink(offer.get(), subId));
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
