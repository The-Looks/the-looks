package vn.thelooks.outfit.application.port.in;

import java.util.List;
import java.util.UUID;
import vn.thelooks.outfit.domain.Occasion;
import vn.thelooks.outfit.domain.OutfitSuggestion;

/** AI gợi ý outfit theo dịp, chỉ dùng đồ đang có trong tủ. */
public interface SuggestOutfitsUseCase {

    List<OutfitSuggestion> suggest(UUID ownerId, Occasion occasion, int limit);
}
