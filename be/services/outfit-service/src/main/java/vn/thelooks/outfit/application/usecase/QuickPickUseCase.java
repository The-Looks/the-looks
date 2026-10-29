package vn.thelooks.outfit.application.usecase;

import java.util.Optional;
import java.util.UUID;
import vn.thelooks.outfit.domain.model.OutfitSuggestion;

/** Một chạm: gợi ý 1 outfit, ưu tiên món lâu chưa mặc. */
public interface QuickPickUseCase {

    /** Rỗng nếu tủ đồ chưa đủ món để phối. */
    Optional<OutfitSuggestion> quickPick(UUID ownerId);
}
