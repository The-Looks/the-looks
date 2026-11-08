package vn.thelooks.outfit.domain.service;

import java.util.HashSet;
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
 * Tìm món tủ đồ còn thiếu, theo thứ tự:
 * <ol>
 *   <li>thiếu hẳn một loại để phối được bộ (áo + quần hoặc váy, kèm giày), phần thân trước giày;</li>
 *   <li>có loại đó nhưng không món nào hợp dịp / hợp phong cách người dùng đã chọn, ví dụ có áo thun nhưng thiếu áo đi làm.</li>
 * </ol>
 * Từ khoá không dấu: tìm có dấu trên TikTok Shop cho kết quả sai.
 */
// ponytail: bảng từ khoá cố định theo phong cách; để AI sinh từ khoá khi có số liệu lượt bấm
public final class WardrobeGaps {

    /** loại đồ → [đi làm, dịp khác], khi tủ thiếu hẳn loại đó. */
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

    /** phong cách → [áo, quần, giày, tên tiếng Việt]. */
    private static final Map<String, String[]> BY_STYLE = Map.ofEntries(
            Map.entry("office", new String[] {"so mi", "quan tay", "loafer", "công sở"}),
            Map.entry("formal", new String[] {"so mi", "quan tay", "giay tay", "lịch sự"}),
            Map.entry("smart-casual", new String[] {"polo", "quan kaki", "loafer", "lịch sự"}),
            Map.entry("elegant", new String[] {"ao kieu", "quan ong rong", "giay cao got", "thanh lịch"}),
            Map.entry("minimal", new String[] {"ao thun tron", "quan kaki", "sneaker trang", "tối giản"}),
            Map.entry("streetwear", new String[] {"ao thun oversize", "quan baggy", "sneaker", "streetwear"}),
            Map.entry("trendy", new String[] {"ao thun oversize", "quan baggy", "sneaker", "cá tính"}),
            Map.entry("sporty", new String[] {"ao the thao", "quan jogger", "giay chay bo", "thể thao"}),
            Map.entry("casual", new String[] {"ao thun", "quan jeans", "sneaker", "thường ngày"}),
            Map.entry("basic", new String[] {"ao thun", "quan jeans", "sneaker", "basic"}),
            Map.entry("preppy", new String[] {"ao polo", "quan kaki", "loafer", "preppy"}),
            Map.entry("feminine", new String[] {"ao kieu", "chan vay", "mary jane", "nữ tính"}),
            Map.entry("romantic", new String[] {"ao kieu", "chan vay", "mary jane", "dịu dàng"}),
            Map.entry("vintage", new String[] {"so mi vintage", "quan ong rong", "giay oxford", "vintage"}));
    private static final List<String> PARTS = List.of("TOP", "BOTTOM", "SHOES");

    private WardrobeGaps() {
    }

    public static Optional<WardrobeGap> find(List<ClosetItem> closet, Occasion occasion) {
        return find(closet, occasion, StylePreferences.NONE);
    }

    public static Optional<WardrobeGap> find(List<ClosetItem> closet, Occasion occasion, StylePreferences prefs) {
        Set<String> have = closet.stream().map(i -> category(i)).collect(Collectors.toSet());
        boolean dress = have.contains("DRESS");
        String missing = !have.contains("TOP") && !dress ? "TOP"
                : !have.contains("BOTTOM") && !dress ? "BOTTOM"
                : !have.contains("SHOES") ? "SHOES"
                : null;
        if (missing != null) {
            Map<String, String[]> words = prefs.gender() == Gender.MALE ? MALE : prefs.gender() == Gender.FEMALE ? FEMALE : NEUTRAL;
            String keyword = words.get(missing)[occasion == Occasion.WORK ? 0 : 1];
            return Optional.of(new WardrobeGap(missing, keyword, LABEL.get(missing), prefs.gender(), prefs.budget(), prefs.colors()));
        }
        return styleGap(closet, occasion, prefs);
    }

    /** Có đủ loại nhưng thiếu món hợp dịp / hợp gu. Món chưa có nhãn phong cách coi như hợp (không đoán bừa). */
    private static Optional<WardrobeGap> styleGap(List<ClosetItem> closet, Occasion occasion, StylePreferences prefs) {
        String style = targetStyle(occasion, prefs);
        if (style == null) {
            return Optional.empty();
        }
        Set<String> wanted = new HashSet<>(occasion == null ? Set.of() : OutfitRecommender.occasionTags(occasion));
        wanted.add(style);
        boolean dressFits = closet.stream().anyMatch(i -> category(i).equals("DRESS") && fits(i, wanted));
        for (int part = 0; part < PARTS.size(); part++) {
            String category = PARTS.get(part);
            if (dressFits && !category.equals("SHOES")) {
                continue;
            }
            boolean covered = closet.stream().anyMatch(i -> category(i).equals(category) && fits(i, wanted));
            if (!covered) {
                String[] words = BY_STYLE.get(style);
                String label = LABEL.get(category) + " " + (occasion == null ? words[3] : occasion.label());
                return Optional.of(new WardrobeGap(category, withGender(words[part], category, prefs.gender()), label,
                        prefs.gender(), prefs.budget(), prefs.colors()));
            }
        }
        return Optional.empty();
    }

    /** Phong cách người dùng chọn hợp dịp này; không có thì phong cách tiêu biểu của dịp. */
    static String targetStyle(Occasion occasion, StylePreferences prefs) {
        var chosen = prefs.styles().stream().sorted().filter(BY_STYLE::containsKey).toList();
        if (occasion == null) {
            return chosen.isEmpty() ? null : chosen.getFirst();
        }
        Set<String> tags = OutfitRecommender.occasionTags(occasion);
        return chosen.stream().filter(tags::contains).findFirst().orElse(switch (occasion) {
            case WORK -> "office";
            case SCHOOL -> "casual";
            case HANGOUT -> "streetwear";
            case DATE -> prefs.gender() == Gender.MALE ? "smart-casual" : "feminine";
        });
    }

    private static String withGender(String keyword, String category, Gender gender) {
        if (category.equals("SHOES") || gender == null || gender == Gender.OTHER || keyword.startsWith("chan vay") || keyword.startsWith("ao kieu")) {
            return keyword;
        }
        return keyword + (gender == Gender.MALE ? " nam" : " nu");
    }

    private static boolean fits(ClosetItem item, Set<String> wanted) {
        return item.styleTags().isEmpty() || item.styleTags().stream().map(t -> t.toLowerCase(Locale.ROOT).trim()).anyMatch(wanted::contains);
    }

    private static String category(ClosetItem item) {
        return item.category().toUpperCase(Locale.ROOT);
    }
}
