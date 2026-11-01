package vn.thelooks.outfit.infrastructure.ai;

import java.util.List;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import vn.thelooks.outfit.application.port.out.OutfitAiAdvisor;
import vn.thelooks.outfit.domain.model.Occasion;
import vn.thelooks.outfit.domain.model.OutfitSuggestion;

/** Khi chưa bật AI (thelooks.ai.provider=none): giữ nguyên thứ tự điểm của OutfitRecommender. */
@Component
@ConditionalOnProperty(name = "thelooks.ai.provider", havingValue = "none", matchIfMissing = true)
class PassThroughOutfitAdvisor implements OutfitAiAdvisor {

    @Override
    public Advice choose(Occasion occasion, List<OutfitSuggestion> candidates, int limit) {
        return Advice.withoutAi(candidates, limit);
    }
}
