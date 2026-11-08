package vn.thelooks.outfit.domain.model;

import java.util.Set;
import vn.thelooks.outfit.domain.model.StylePreferences.Budget;
import vn.thelooks.outfit.domain.model.StylePreferences.Gender;

/**
 * Loại đồ tủ đồ còn thiếu để phối trọn bộ cho một dịp.
 *
 * @param category TOP / BOTTOM / SHOES
 * @param keyword  từ khoá tìm sản phẩm (ngắn, phổ biến trong tên sản phẩm trên sàn)
 * @param label    tên tiếng Việt cho người dùng, vd "giày"
 * @param gender   null = không lọc theo giới tính
 * @param budget   null = không lọc theo giá
 * @param colors   màu người dùng thích (nhãn tiếng Anh như "white"); sản phẩm có màu này được xếp trước
 */
public record WardrobeGap(String category, String keyword, String label, Gender gender, Budget budget, Set<String> colors) {

    public WardrobeGap {
        colors = colors == null ? Set.of() : Set.copyOf(colors);
    }

    public WardrobeGap(String category, String keyword, String label) {
        this(category, keyword, label, null, null, Set.of());
    }
}
