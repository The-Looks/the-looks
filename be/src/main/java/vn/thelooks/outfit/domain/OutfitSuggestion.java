package vn.thelooks.outfit.domain;

import java.util.List;

/**
 * Một gợi ý phối đồ (chưa lưu).
 *
 * @param occasion null với Quick Pick
 * @param score    điểm càng cao càng phù hợp
 * @param reason   giải thích ngắn cho người dùng, ví dụ "Áo này 3 tuần chưa mặc"
 */
public record OutfitSuggestion(
        List<ClosetItem> items,
        Occasion occasion,
        double score,
        String reason) {
}
