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

    /** Rỗng khi tủ đồ đủ món, hoặc không tìm được sản phẩm. */
    Optional<Suggestion> suggest(UUID ownerId, Occasion occasion);

    /** Ghi lượt bấm rồi trả link affiliate. Rỗng nếu sản phẩm không còn trong kết quả gần đây. */
    Optional<URI> open(UUID ownerId, String productId);

    record Suggestion(WardrobeGap gap, List<ProductOffer> products) {
    }
}
