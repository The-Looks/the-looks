package vn.thelooks.wardrobe;

import java.net.URI;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/** Dữ liệu món đồ cho module khác. Dùng String thay cho enum domain để không lộ kiểu nội bộ. */
public record WardrobeItemView(
        UUID id,
        String category,
        List<String> colors,
        Set<String> seasons,
        Set<String> styleTags,
        URI imageUrl) {
}
