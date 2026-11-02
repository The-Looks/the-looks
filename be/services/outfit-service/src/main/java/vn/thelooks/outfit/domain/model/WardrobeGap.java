package vn.thelooks.outfit.domain.model;

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
 */
public record WardrobeGap(String category, String keyword, String label, Gender gender, Budget budget) {

    public WardrobeGap(String category, String keyword, String label) {
        this(category, keyword, label, null, null);
    }
}
