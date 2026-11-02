package vn.thelooks.outfit.domain.service;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import vn.thelooks.outfit.domain.model.ClosetItem;
import vn.thelooks.outfit.domain.model.Occasion;
import vn.thelooks.outfit.domain.model.WardrobeGap;

/**
 * Tìm loại đồ còn thiếu để phối được một bộ (áo + quần hoặc váy, kèm giày). Ưu tiên phần thân trước giày,
 * vì thiếu phần thân thì không phối được bộ nào.
 */
// ponytail: từ khoá cố định theo dịp (đã thử trên TikTok Shop); để AI sinh từ khoá theo gu khi có số liệu lượt bấm
public final class WardrobeGaps {

    private WardrobeGaps() {
    }

    public static Optional<WardrobeGap> find(List<ClosetItem> closet, Occasion occasion) {
        Set<String> have = closet.stream().map(i -> i.category().toUpperCase(Locale.ROOT)).collect(Collectors.toSet());
        boolean dress = have.contains("DRESS");
        boolean work = occasion == Occasion.WORK;
        if (!have.contains("TOP") && !dress) {
            return Optional.of(new WardrobeGap("TOP", work ? "polo" : "ao thun", "áo"));
        }
        if (!have.contains("BOTTOM") && !dress) {
            return Optional.of(new WardrobeGap("BOTTOM", work ? "baggy" : "jeans", "quần"));
        }
        if (!have.contains("SHOES")) {
            return Optional.of(new WardrobeGap("SHOES", work ? "loafer" : "sneaker", "giày"));
        }
        return Optional.empty();
    }
}
