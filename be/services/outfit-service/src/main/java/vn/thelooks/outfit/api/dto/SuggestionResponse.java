package vn.thelooks.outfit.api.dto;

import java.util.List;
import vn.thelooks.outfit.domain.model.Occasion;
import vn.thelooks.outfit.domain.model.OutfitSuggestion;

public record SuggestionResponse(List<OutfitItemResponse> items, Occasion occasion, double score, String reason) {

    public static SuggestionResponse from(OutfitSuggestion s) {
        return new SuggestionResponse(s.items().stream().map(OutfitItemResponse::from).toList(),
                s.occasion(), s.score(), s.reason());
    }
}
