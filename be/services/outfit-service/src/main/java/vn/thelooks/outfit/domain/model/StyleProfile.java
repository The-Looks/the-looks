package vn.thelooks.outfit.domain.model;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * "Gu" của một người dùng, học từ hành vi của chính họ: 👍/👎, outfit đã lưu, số lần mặc từng món.
 * Mỗi phong cách / màu có điểm từ -1 (né) đến 1 (rất hay chọn). Không phải huấn luyện model:
 * điểm này dùng để cộng điểm trong thuật toán và gửi kèm cho AI dưới dạng tóm tắt.
 *
 * @param signals số hành vi đã ghi nhận; ít hơn {@link #MIN_SIGNALS} thì chưa đủ để đoán gu
 */
public record StyleProfile(Map<String, Double> styles, Map<String, Double> colors, int signals) {

    public static final StyleProfile NONE = new StyleProfile(Map.of(), Map.of(), 0);
    static final int MIN_SIGNALS = 3;
    static final double LIKE = 2, DISLIKE = -2, SAVED = 1, WORN = 1;
    /** Một món mặc rất nhiều lần không được lấn át mọi tín hiệu khác. */
    static final int MAX_WEAR_COUNT = 5;

    public static StyleProfile learn(Collection<ClosetItem> closet, Map<String, Feedback> feedback,
            Collection<Outfit> saved, Map<UUID, Long> wearCount) {
        Map<UUID, ClosetItem> byId = closet.stream().collect(Collectors.toMap(ClosetItem::id, Function.identity(), (a, b) -> a));
        Map<String, Double> styles = new HashMap<>();
        Map<String, Double> colors = new HashMap<>();
        int signals = 0;
        for (var entry : feedback.entrySet()) {
            double w = entry.getValue() == Feedback.LIKE ? LIKE : DISLIKE;
            for (String id : entry.getKey().split(",")) {
                add(byId.get(UUID.fromString(id)), w, styles, colors);
            }
            signals++;
        }
        for (Outfit outfit : saved) {
            outfit.itemIds().forEach(id -> add(byId.get(id), SAVED, styles, colors));
            signals++;
        }
        for (var entry : wearCount.entrySet()) {
            long times = Math.min(entry.getValue(), MAX_WEAR_COUNT);
            add(byId.get(entry.getKey()), WORN * times, styles, colors);
            signals += (int) times;
        }
        return new StyleProfile(normalize(styles), normalize(colors), signals);
    }

    private static void add(ClosetItem item, double weight, Map<String, Double> styles, Map<String, Double> colors) {
        if (item == null) {
            return; // món đã bị xoá khỏi tủ
        }
        item.styleTags().forEach(t -> styles.merge(key(t), weight, Double::sum));
        item.colors().forEach(c -> colors.merge(key(c), weight, Double::sum));
    }

    private static Map<String, Double> normalize(Map<String, Double> raw) {
        double max = raw.values().stream().mapToDouble(Math::abs).max().orElse(0);
        if (max == 0) {
            return Map.of();
        }
        return raw.entrySet().stream().collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue() / max));
    }

    private static String key(String s) {
        return s.toLowerCase(Locale.ROOT).trim();
    }

    public boolean known() {
        return signals >= MIN_SIGNALS;
    }

    /** Mức hợp gu của một bộ, -1..1; 0 khi chưa đủ dữ liệu. */
    public double affinity(List<ClosetItem> items) {
        if (!known() || items.isEmpty()) {
            return 0;
        }
        double sum = 0;
        for (ClosetItem item : items) {
            sum += (average(item.styleTags(), styles) + average(item.colors(), colors)) / 2;
        }
        return sum / items.size();
    }

    private static double average(Collection<String> values, Map<String, Double> scores) {
        return values.isEmpty() ? 0 : values.stream().mapToDouble(v -> scores.getOrDefault(key(v), 0.0)).average().orElse(0);
    }

    /** Tóm tắt cho AI, ví dụ "Hay chọn phong cách casual, minimal; màu trắng, be. Ít hợp: màu đỏ." Rỗng khi chưa đủ dữ liệu. */
    public String summary() {
        if (!known()) {
            return "";
        }
        String likedStyles = top(styles, true), likedColors = top(colors, true);
        String avoidStyles = top(styles, false), avoidColors = top(colors, false);
        StringBuilder sb = new StringBuilder();
        if (!likedStyles.isEmpty() || !likedColors.isEmpty()) {
            sb.append("Hay chọn");
            if (!likedStyles.isEmpty()) sb.append(" phong cách ").append(likedStyles);
            if (!likedColors.isEmpty()) sb.append(likedStyles.isEmpty() ? " " : "; ").append("màu ").append(likedColors);
            sb.append(".");
        }
        if (!avoidStyles.isEmpty() || !avoidColors.isEmpty()) {
            sb.append(sb.isEmpty() ? "" : " ").append("Ít hợp:");
            if (!avoidStyles.isEmpty()) sb.append(" phong cách ").append(avoidStyles);
            if (!avoidColors.isEmpty()) sb.append(avoidStyles.isEmpty() ? " " : "; ").append("màu ").append(avoidColors);
            sb.append(".");
        }
        return sb.toString();
    }

    private static String top(Map<String, Double> scores, boolean positive) {
        return scores.entrySet().stream()
                .filter(e -> positive ? e.getValue() >= 0.3 : e.getValue() <= -0.3)
                .sorted((a, b) -> positive ? Double.compare(b.getValue(), a.getValue()) : Double.compare(a.getValue(), b.getValue()))
                .limit(3)
                .map(Map.Entry::getKey)
                .collect(Collectors.joining(", "));
    }
}
