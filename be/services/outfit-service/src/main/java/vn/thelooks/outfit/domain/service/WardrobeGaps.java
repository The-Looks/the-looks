package vn.thelooks.outfit.domain.service;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import vn.thelooks.outfit.domain.model.ClosetItem;
import vn.thelooks.outfit.domain.model.Occasion;
import vn.thelooks.outfit.domain.model.StylePreferences;
import vn.thelooks.outfit.domain.model.StylePreferences.Gender;
import vn.thelooks.outfit.domain.model.WardrobeGap;

/**
 * Tìm loại đồ còn thiếu để phối được một bộ (áo + quần hoặc váy, kèm giày). Ưu tiên phần thân trước giày,
 * vì thiếu phần thân thì không phối được bộ nào.
 */
// ponytail: từ khoá cố định (đã thử trên TikTok Shop, tìm có dấu cho kết quả sai); để AI sinh từ khoá khi có số liệu lượt bấm
public final class WardrobeGaps {

    /** loại đồ → [đi làm, dịp khác]. */
    private static final Map<String, String[]> NEUTRAL = Map.of(
            "TOP", new String[] {"polo", "ao thun"},
            "BOTTOM", new String[] {"baggy", "jeans"},
            "SHOES", new String[] {"loafer", "sneaker"});
    private static final Map<String, String[]> MALE = Map.of(
            "TOP", new String[] {"polo nam", "ao thun nam"},
            "BOTTOM", new String[] {"baggy", "jeans nam"},
            "SHOES", new String[] {"loafer", "sneaker nam"});
    private static final Map<String, String[]> FEMALE = Map.of(
            "TOP", new String[] {"babydoll", "croptop"},
            "BOTTOM", new String[] {"culottes", "jeans nu"},
            "SHOES", new String[] {"mary jane", "sneaker"});
    private static final Map<String, String> LABEL = Map.of("TOP", "áo", "BOTTOM", "quần", "SHOES", "giày");

    private WardrobeGaps() {
    }

    public static Optional<WardrobeGap> find(List<ClosetItem> closet, Occasion occasion) {
        return find(closet, occasion, StylePreferences.NONE);
    }

    public static Optional<WardrobeGap> find(List<ClosetItem> closet, Occasion occasion, StylePreferences prefs) {
        Set<String> have = closet.stream().map(i -> i.category().toUpperCase(Locale.ROOT)).collect(Collectors.toSet());
        boolean dress = have.contains("DRESS");
        String missing = !have.contains("TOP") && !dress ? "TOP"
                : !have.contains("BOTTOM") && !dress ? "BOTTOM"
                : !have.contains("SHOES") ? "SHOES"
                : null;
        if (missing == null) {
            return Optional.empty();
        }
        Map<String, String[]> words = prefs.gender() == Gender.MALE ? MALE : prefs.gender() == Gender.FEMALE ? FEMALE : NEUTRAL;
        String keyword = words.get(missing)[occasion == Occasion.WORK ? 0 : 1];
        return Optional.of(new WardrobeGap(missing, keyword, LABEL.get(missing), prefs.gender(), prefs.budget()));
    }
}
