package vn.thelooks.outfit.application.usecase;

import java.net.URI;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import vn.thelooks.outfit.domain.model.Occasion;
import vn.thelooks.outfit.domain.model.ProductOffer;
import vn.thelooks.outfit.domain.model.WardrobeGap;

/** "Gợi ý mua thêm": món tủ đồ còn thiếu cho dịp này + sản phẩm phù hợp trên sàn (link affiliate). */
public interface ShopForGapUseCase {

    /** Rỗng khi không tìm được sản phẩm nào (cả món còn thiếu lẫn bộ gợi ý). */
    Optional<Suggestion> suggest(UUID ownerId, Occasion occasion);

    /** Ghi lượt bấm rồi trả link affiliate. Rỗng nếu sản phẩm không còn trong kết quả gần đây. */
    Optional<URI> open(UUID ownerId, String productId);

    /**
     * @param gap      món tủ đồ còn thiếu (null nếu đủ) và products = sản phẩm cho món đó
     * @param look     bộ đồ hợp dịp để mua: mỗi món một sản phẩm, owned = tủ đồ đã có món loại này
     */
    record Suggestion(WardrobeGap gap, List<ProductOffer> products, List<LookItem> look) {
    }

    record LookItem(WardrobeGap piece, boolean owned, ProductOffer product) {
    }
}
