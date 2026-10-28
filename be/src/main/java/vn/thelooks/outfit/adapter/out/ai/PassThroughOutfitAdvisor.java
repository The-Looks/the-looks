package vn.thelooks.outfit.adapter.out.ai;

import java.util.List;
import org.springframework.stereotype.Component;
import vn.thelooks.outfit.application.port.out.OutfitAiAdvisor;
import vn.thelooks.outfit.domain.Occasion;
import vn.thelooks.outfit.domain.OutfitSuggestion;

/**
 * Bản mặc định khi chưa nối AI: giữ nguyên thứ tự điểm của OutfitRecommender.
 * Khi chọn xong nhà cung cấp AI, thêm adapter mới cài đặt OutfitAiAdvisor và bỏ class này.
 */
@Component
class PassThroughOutfitAdvisor implements OutfitAiAdvisor {

    @Override
    public List<OutfitSuggestion> choose(Occasion occasion, List<OutfitSuggestion> candidates, int limit) {
        return candidates.stream().limit(Math.max(limit, 0)).toList();
    }
}
