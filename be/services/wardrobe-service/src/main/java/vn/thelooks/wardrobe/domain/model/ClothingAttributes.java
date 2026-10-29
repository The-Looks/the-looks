package vn.thelooks.wardrobe.domain.model;

import java.util.List;
import java.util.Set;

/** Thuộc tính do AI nhận diện, người dùng có thể sửa trước khi xác nhận. */
public record ClothingAttributes(
        Category category,
        List<String> colors,
        String material,
        Set<Season> seasons,
        Set<String> styleTags) {
}
