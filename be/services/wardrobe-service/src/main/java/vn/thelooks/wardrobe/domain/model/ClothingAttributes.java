package vn.thelooks.wardrobe.domain.model;

import java.util.List;
import java.math.BigDecimal;
import java.time.LocalDate;
import vn.thelooks.wardrobe.domain.exception.InvalidItemStateException;
import java.util.Set;

/** Thuộc tính do AI nhận diện, người dùng có thể sửa trước khi xác nhận. */
public record ClothingAttributes(
        Category category,
        List<String> colors,
        String material,
        Set<Season> seasons,
        Set<String> styleTags,
        BigDecimal purchasePrice,
        LocalDate purchaseDate,
        String brand) {

    public ClothingAttributes {
        if (purchasePrice != null && (purchasePrice.signum() < 0 || purchasePrice.scale() > 2
                || purchasePrice.precision() - purchasePrice.scale() > 12)) {
            throw new InvalidItemStateException("Giá mua phải không âm, tối đa 12 chữ số và 2 số thập phân");
        }
        brand = brand == null || brand.isBlank() ? null : brand.trim();
        if (brand != null && brand.length() > 100) {
            throw new InvalidItemStateException("Thương hiệu tối đa 100 ký tự");
        }
    }

    /** AI chỉ cung cấp thuộc tính nhận diện; thông tin mua hàng do người dùng nhập. */
    public ClothingAttributes(Category category, List<String> colors, String material, Set<Season> seasons,
            Set<String> styleTags) {
        this(category, colors, material, seasons, styleTags, null, null, null);
    }
}
