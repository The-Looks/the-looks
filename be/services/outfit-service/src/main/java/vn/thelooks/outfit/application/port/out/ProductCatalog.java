package vn.thelooks.outfit.application.port.out;

import java.net.URI;
import java.util.List;
import java.util.Optional;
import vn.thelooks.outfit.domain.model.ProductOffer;
import vn.thelooks.outfit.domain.model.WardrobeGap;

/** Sàn bán hàng qua mạng affiliate. Cài đặt: TikTok Shop qua AccessTrade. Chưa cấu hình thì trả rỗng. */
public interface ProductCatalog {

    /** Sản phẩm đúng loại, còn hàng, bán chạy trước. Lỗi mạng: trả rỗng. */
    List<ProductOffer> search(WardrobeGap gap, int limit);

    /** Sản phẩm đã trả về từ search gần đây (chỉ tạo link cho sản phẩm do server tìm, không nhận link từ client). */
    Optional<ProductOffer> find(String productId);

    /** Link affiliate; {@code subId} gắn vào link để biết lượt mua đến từ người dùng nào (đã ẩn danh). */
    URI affiliateLink(ProductOffer offer, String subId);
}
