package vn.thelooks.outfit.application.usecase;

import java.util.List;
import java.util.UUID;
import vn.thelooks.outfit.domain.model.Feedback;

/** Nút thích / không thích trên một gợi ý. Bấm lại lần sau thì ghi đè lần trước. */
public interface RateSuggestionUseCase {

    void rate(UUID ownerId, List<UUID> itemIds, Feedback feedback);
}
