package vn.thelooks.outfit.application.port.out;

import java.util.List;
import vn.thelooks.outfit.domain.model.Occasion;
import vn.thelooks.outfit.domain.model.OutfitSuggestion;

/**
 * AI chọn/xếp hạng outfit. Code lọc ứng viên hợp lệ trước (đúng dịp, đúng mùa, có trong tủ),
 * AI chỉ chọn trong số đó và viết lý do — không tự bịa món người dùng không có.
 */
public interface OutfitAiAdvisor {

    /** @param occasion null với Quick Pick */
    List<OutfitSuggestion> choose(Occasion occasion, List<OutfitSuggestion> candidates, int limit);
}
