package vn.thelooks.outfit.domain.model;

import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Hồ sơ phong cách người dùng tự khai (onboarding / trang Cá nhân). Mọi trường đều không bắt buộc.
 * Dùng làm gu ban đầu khi chưa có lượt thích / outfit đã lưu, và để chọn sản phẩm "Gợi ý mua thêm".
 *
 * @param gender null = không muốn nói
 * @param styles nhãn phong cách, thuộc {@link #STYLES}
 * @param budget null = không giới hạn
 * @param colors màu yêu thích, cùng kiểu nhãn màu AI gán cho món đồ ("white", "beige"…), tối đa {@link #MAX_COLORS}
 */
public record StylePreferences(Gender gender, Set<String> styles, Budget budget, Set<String> colors) {

    /** Cùng bộ nhãn với styleTags AI gán cho món đồ, để so được với tủ đồ. */
    public static final Set<String> STYLES = Set.of("feminine", "sporty", "minimal", "streetwear", "vintage", "office",
            "casual", "preppy", "elegant", "smart-casual", "trendy", "romantic");
    public static final StylePreferences NONE = new StylePreferences(null, Set.of(), null, Set.of());
    public static final int MAX_COLORS = 8;
    private static final Pattern COLOR = Pattern.compile("[a-z][a-z -]{0,19}");

    public StylePreferences {
        styles = styles == null ? Set.of() : Set.copyOf(styles);
        if (!STYLES.containsAll(styles)) {
            throw new IllegalArgumentException("Phong cách không hợp lệ: " + styles);
        }
        colors = colors == null ? Set.of()
                : colors.stream().map(c -> c == null ? "" : c.trim().toLowerCase(Locale.ROOT)).collect(Collectors.toUnmodifiableSet());
        if (colors.size() > MAX_COLORS || !colors.stream().allMatch(c -> COLOR.matcher(c).matches())) {
            throw new IllegalArgumentException("Chọn tối đa " + MAX_COLORS + " màu, tên màu chỉ gồm chữ cái");
        }
    }

    public enum Gender {
        MALE,
        FEMALE,
        OTHER
    }

    /** Khoảng giá một món, VND. */
    public enum Budget {
        LOW(0, 200_000),
        MID(200_000, 500_000),
        HIGH(500_000, Long.MAX_VALUE);

        private final long min;
        private final long max;

        Budget(long min, long max) {
            this.min = min;
            this.max = max;
        }

        public boolean fits(long priceVnd) {
            return priceVnd >= min && priceVnd < max;
        }
    }
}
