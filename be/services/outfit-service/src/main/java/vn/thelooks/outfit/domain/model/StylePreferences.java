package vn.thelooks.outfit.domain.model;

import java.util.Set;

/**
 * Hồ sơ phong cách người dùng tự khai (onboarding / trang Cá nhân). Mọi trường đều không bắt buộc.
 * Dùng làm gu ban đầu khi chưa có lượt thích / outfit đã lưu, và để chọn sản phẩm "Gợi ý mua thêm".
 *
 * @param gender null = không muốn nói
 * @param styles nhãn phong cách, thuộc {@link #STYLES}
 * @param budget null = không giới hạn
 */
public record StylePreferences(Gender gender, Set<String> styles, Budget budget) {

    /** Cùng bộ nhãn với styleTags AI gán cho món đồ, để so được với tủ đồ. */
    public static final Set<String> STYLES = Set.of("feminine", "sporty", "minimal", "streetwear", "vintage", "office");
    public static final StylePreferences NONE = new StylePreferences(null, Set.of(), null);

    public StylePreferences {
        styles = styles == null ? Set.of() : Set.copyOf(styles);
        if (!STYLES.containsAll(styles)) {
            throw new IllegalArgumentException("Phong cách không hợp lệ: " + styles);
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
