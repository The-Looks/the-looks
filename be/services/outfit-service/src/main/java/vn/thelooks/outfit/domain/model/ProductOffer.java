package vn.thelooks.outfit.domain.model;

import java.net.URI;

/** Sản phẩm trên sàn gợi ý cho món còn thiếu. Giá theo khoảng vì một sản phẩm có nhiều phân loại. */
public record ProductOffer(
        String id,
        String title,
        URI imageUrl,
        long minPriceVnd,
        long maxPriceVnd,
        String shopName,
        long unitsSold,
        URI productUrl,
        String source) {
}
