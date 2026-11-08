package vn.thelooks.outfit.domain.service;

import java.time.Duration;
import java.time.Instant;
import java.time.Month;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import vn.thelooks.outfit.domain.model.ClosetItem;
import vn.thelooks.outfit.domain.model.Feedback;
import vn.thelooks.outfit.domain.model.Occasion;
import vn.thelooks.outfit.domain.model.OutfitSuggestion;
import vn.thelooks.outfit.domain.model.StyleProfile;

/**
 * Lõi "Wear More": phối đồ từ những món đang có, chấm điểm và ưu tiên món lâu chưa mặc.
 * Java thuần, không phụ thuộc Spring/JPA để unit test dễ.
 *
 * <p>Điểm = độ hợp dịp + độ hài hoà màu + độ "lâu chưa mặc". Quick Pick (occasion = null) bỏ phần hợp dịp,
 * dồn trọng số cho độ lâu chưa mặc.
 *
 * <p>Phản hồi của người dùng: tổ hợp bị "không thích" không bao giờ được gợi ý lại; tổ hợp "thích" được cộng điểm.
 */
public class OutfitRecommender {

    /** Quá số ngày này coi như "lâu chưa mặc" tối đa. */
    static final int FRESHNESS_CAP_DAYS = 30;
    /** Điểm cộng cho tổ hợp người dùng đã thích. */
    static final double LIKE_BONUS = 0.1;
    /** Trọng số của gu cá nhân (StyleProfile.affinity, -1..1). */
    static final double TASTE_WEIGHT = 0.15;

    // ponytail: bảng tag/màu cố định theo nhãn AI trả về; chuyển vào DB/config khi nhãn AI ổn định
    private static final Map<Occasion, Set<String>> OCCASION_TAGS = Map.of(
            Occasion.SCHOOL, Set.of("casual", "basic", "sporty", "streetwear", "preppy"),
            Occasion.WORK, Set.of("formal", "office", "smart-casual", "minimal", "elegant"),
            Occasion.HANGOUT, Set.of("casual", "streetwear", "sporty", "trendy", "basic"),
            Occasion.DATE, Set.of("elegant", "romantic", "trendy", "smart-casual", "feminine"));

    /** Nhãn phong cách hợp một dịp. */
    public static Set<String> occasionTags(Occasion occasion) {
        return OCCASION_TAGS.get(occasion);
    }

    private static final Set<String> NEUTRAL_COLORS = Set.of(
            "black", "white", "gray", "grey", "beige", "navy", "brown", "cream", "denim",
            "đen", "trắng", "xám", "be", "nâu", "kem");

    public List<OutfitSuggestion> recommend(
            List<ClosetItem> closet,
            Map<UUID, Instant> lastWornAt,
            Occasion occasion,
            Instant now,
            Set<String> seasons,
            int limit) {
        return recommend(closet, lastWornAt, Map.of(), occasion, now, seasons, limit);
    }

    /**
     * @param feedback comboKey (xem {@link Feedback#comboKey}) → phản hồi của người dùng
     * @param seasons  mùa phù hợp lúc này ({@link #seasonsFor} theo nhiệt độ, hoặc mùa của tháng);
     *                 món có ghi mùa mà không thuộc tập này thì bỏ qua, món không ghi mùa thì luôn dùng được
     */
    public List<OutfitSuggestion> recommend(
            List<ClosetItem> closet,
            Map<UUID, Instant> lastWornAt,
            Map<String, Feedback> feedback,
            Occasion occasion,
            Instant now,
            Set<String> seasons,
            int limit) {
        return recommend(closet, lastWornAt, feedback, StyleProfile.NONE, occasion, now, seasons, limit);
    }

    /** @param taste gu của người dùng: bộ hợp gu được cộng điểm, bộ chạm vào thứ họ hay né bị trừ điểm */
    public List<OutfitSuggestion> recommend(
            List<ClosetItem> closet,
            Map<UUID, Instant> lastWornAt,
            Map<String, Feedback> feedback,
            StyleProfile taste,
            Occasion occasion,
            Instant now,
            Set<String> seasons,
            int limit) {
        if (limit <= 0) {
            return List.of();
        }
        List<ClosetItem> tops = new ArrayList<>();
        List<ClosetItem> bottoms = new ArrayList<>();
        List<ClosetItem> dresses = new ArrayList<>();
        List<ClosetItem> shoes = new ArrayList<>();
        for (ClosetItem item : closet) {
            if (!item.seasons().isEmpty() && item.seasons().stream().noneMatch(seasons::contains)) {
                continue;
            }
            switch (item.category().toUpperCase(Locale.ROOT)) {
                case "TOP" -> tops.add(item);
                case "BOTTOM" -> bottoms.add(item);
                case "DRESS" -> dresses.add(item);
                case "SHOES" -> shoes.add(item);
                default -> { } // OUTERWEAR, BAG, ACCESSORY: chưa dùng để phối
            }
        }

        List<List<ClosetItem>> bases = new ArrayList<>();
        for (ClosetItem top : tops) {
            for (ClosetItem bottom : bottoms) {
                bases.add(List.of(top, bottom));
            }
        }
        dresses.forEach(dress -> bases.add(List.of(dress)));

        List<OutfitSuggestion> candidates = new ArrayList<>();
        for (List<ClosetItem> base : bases) {
            // Có giày thì phối kèm đôi hợp nhất (bỏ qua tổ hợp bị không thích); không có giày thì gợi ý phần thân.
            OutfitSuggestion best = null;
            for (ClosetItem shoe : shoes) {
                List<ClosetItem> withShoe = new ArrayList<>(base);
                withShoe.add(shoe);
                OutfitSuggestion scored = score(withShoe, lastWornAt, feedback, taste, occasion, now);
                if (scored != null && (best == null || scored.score() > best.score())) {
                    best = scored;
                }
            }
            if (best == null && shoes.isEmpty()) {
                best = score(base, lastWornAt, feedback, taste, occasion, now);
            }
            if (best != null) {
                candidates.add(best);
            }
        }
        candidates.sort(Comparator.comparingDouble(OutfitSuggestion::score).reversed());
        return pickDiverse(candidates, limit);
    }

    /** Ưu tiên gợi ý không trùng áo/quần/váy với gợi ý đã chọn; thiếu thì lấp bằng phần còn lại. */
    private static List<OutfitSuggestion> pickDiverse(List<OutfitSuggestion> sorted, int limit) {
        List<OutfitSuggestion> picked = new ArrayList<>();
        Set<UUID> usedBaseItems = new HashSet<>();
        for (OutfitSuggestion s : sorted) {
            if (picked.size() == limit) {
                return picked;
            }
            List<UUID> baseIds = s.items().stream()
                    .filter(i -> !i.category().equalsIgnoreCase("SHOES"))
                    .map(ClosetItem::id)
                    .toList();
            if (baseIds.stream().noneMatch(usedBaseItems::contains)) {
                picked.add(s);
                usedBaseItems.addAll(baseIds);
            }
        }
        for (OutfitSuggestion s : sorted) {
            if (picked.size() == limit) {
                break;
            }
            if (!picked.contains(s)) {
                picked.add(s);
            }
        }
        return picked;
    }

    /** @return null nếu người dùng đã không thích tổ hợp này */
    private static OutfitSuggestion score(List<ClosetItem> items, Map<UUID, Instant> lastWornAt,
            Map<String, Feedback> feedback, StyleProfile taste, Occasion occasion, Instant now) {
        Feedback vote = feedback.get(Feedback.comboKey(items.stream().map(ClosetItem::id).toList()));
        if (vote == Feedback.DISLIKE) {
            return null;
        }
        double harmony = colorHarmony(items);
        double freshness = 0;
        long stalestDays = -1; // Long.MAX_VALUE = chưa mặc lần nào
        for (ClosetItem item : items) {
            Instant worn = lastWornAt.get(item.id());
            long days = worn == null ? Long.MAX_VALUE : Math.max(0, Duration.between(worn, now).toDays());
            freshness += Math.min(days, FRESHNESS_CAP_DAYS) / (double) FRESHNESS_CAP_DAYS;
            stalestDays = Math.max(stalestDays, days);
        }
        freshness /= items.size();

        double score;
        List<String> reasons = new ArrayList<>();
        if (vote == Feedback.LIKE) {
            reasons.add("Bạn từng thích bộ này");
        }
        if (occasion == null) {
            score = 0.6 * freshness + 0.4 * harmony;
        } else {
            double fit = occasionFit(items, occasion);
            score = 0.5 * fit + 0.25 * harmony + 0.25 * freshness;
            if (fit >= 0.75) {
                reasons.add("Hợp dịp " + occasion.label());
            }
        }
        if (stalestDays == Long.MAX_VALUE) {
            reasons.add("Có món bạn chưa mặc lần nào");
        } else if (stalestDays >= 7) {
            reasons.add("Có món " + stalestDays + " ngày chưa mặc");
        }
        if (harmony == 1.0) {
            reasons.add("Màu sắc hài hoà");
        }
        if (vote == Feedback.LIKE) {
            score += LIKE_BONUS;
        }
        double affinity = taste.affinity(items);
        if (affinity >= 0.5) {
            reasons.add("Đúng gu của bạn");
        }
        score = Math.max(0, Math.min(1.0, score + TASTE_WEIGHT * affinity));
        String reason = reasons.isEmpty() ? "Phối từ đồ bạn đang có" : String.join(" · ", reasons);
        return new OutfitSuggestion(List.copyOf(items), occasion, score, reason);
    }

    /** Tỉ lệ món có tag hợp dịp; món chưa có tag tính 0.5. */
    private static double occasionFit(List<ClosetItem> items, Occasion occasion) {
        Set<String> wanted = OCCASION_TAGS.get(occasion);
        double sum = 0;
        for (ClosetItem item : items) {
            if (item.styleTags().isEmpty()) {
                sum += 0.5;
            } else if (item.styleTags().stream().map(t -> t.toLowerCase(Locale.ROOT)).anyMatch(wanted::contains)) {
                sum += 1;
            }
        }
        return sum / items.size();
    }

    /** Màu trung tính đi với mọi màu; càng nhiều màu nổi khác nhau càng kém hài hoà. */
    private static double colorHarmony(List<ClosetItem> items) {
        long accents = items.stream()
                .flatMap(i -> i.colors().stream())
                .map(c -> c.toLowerCase(Locale.ROOT).trim())
                .filter(c -> !NEUTRAL_COLORS.contains(c))
                .distinct()
                .count();
        return accents <= 1 ? 1.0 : accents == 2 ? 0.7 : 0.3;
    }

    /**
     * Mùa nào mặc hợp với nhiệt độ hiện tại. Dùng khi có thời tiết thật, chính xác hơn mùa theo tháng
     * (TP.HCM gần như quanh năm là "hè").
     */
    public static Set<String> seasonsFor(double temperatureC) {
        if (temperatureC >= 28) {
            return Set.of("SUMMER", "SPRING");
        }
        if (temperatureC >= 20) {
            return Set.of("SPRING", "SUMMER", "AUTUMN");
        }
        return Set.of("AUTUMN", "WINTER");
    }

    // ponytail: mùa theo tháng kiểu miền Bắc; miền Nam gần như không có mùa đông, thêm vùng khi có dữ liệu vị trí
    public static String seasonOf(Month month) {
        return switch (month) {
            case MARCH, APRIL, MAY -> "SPRING";
            case JUNE, JULY, AUGUST -> "SUMMER";
            case SEPTEMBER, OCTOBER, NOVEMBER -> "AUTUMN";
            case DECEMBER, JANUARY, FEBRUARY -> "WINTER";
        };
    }
}
