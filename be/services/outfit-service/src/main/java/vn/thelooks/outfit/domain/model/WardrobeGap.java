package vn.thelooks.outfit.domain.model;

/**
 * Loại đồ tủ đồ còn thiếu để phối trọn bộ cho một dịp.
 *
 * @param category TOP / BOTTOM / SHOES
 * @param keyword  từ khoá tìm sản phẩm (ngắn, phổ biến trong tên sản phẩm trên sàn)
 * @param label    tên tiếng Việt cho người dùng, vd "giày"
 */
public record WardrobeGap(String category, String keyword, String label) {
}
