package vn.thelooks.outfit.application.port.out;

import java.util.List;
import vn.thelooks.outfit.domain.model.AiUsage;
import vn.thelooks.outfit.domain.model.Occasion;
import vn.thelooks.outfit.domain.model.OutfitSuggestion;
import vn.thelooks.outfit.domain.model.StyleProfile;

/**
 * AI chọn/xếp hạng outfit. Code lọc ứng viên hợp lệ trước (đúng dịp, đúng mùa, có trong tủ),
 * AI chỉ chọn trong số đó và viết lý do — không tự bịa món người dùng không có.
 */
public interface OutfitAiAdvisor {

    /**
     * @param occasion null với Quick Pick
     * @param taste    gu học từ hành vi người dùng, để AI chọn sát sở thích
     */
    Advice choose(Occasion occasion, List<OutfitSuggestion> candidates, StyleProfile taste, int limit);

    /** @param usage null khi không gọi AI (bản pass-through, hoặc AI lỗi và đã quay về thứ tự điểm) */
    record Advice(List<OutfitSuggestion> suggestions, AiUsage usage) {

        public static Advice withoutAi(List<OutfitSuggestion> candidates, int limit) {
            return new Advice(candidates.stream().limit(Math.max(limit, 0)).toList(), null);
        }
    }
}
