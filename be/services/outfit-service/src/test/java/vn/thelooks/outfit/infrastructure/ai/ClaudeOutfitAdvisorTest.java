package vn.thelooks.outfit.infrastructure.ai;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.thelooks.outfit.domain.model.ClosetItem;
import vn.thelooks.outfit.domain.model.Occasion;
import vn.thelooks.outfit.domain.model.OutfitSuggestion;
import vn.thelooks.outfit.infrastructure.ai.ClaudeOutfitAdvisor.Pick;
import vn.thelooks.outfit.infrastructure.ai.ClaudeOutfitAdvisor.Picks;

/** Không gọi API thật: kiểm tra phần xử lý câu trả lời và prompt. */
class ClaudeOutfitAdvisorTest {

    static OutfitSuggestion suggestion(String category, double score) {
        var item = new ClosetItem(UUID.randomUUID(), category, List.of("white"), Set.of(), Set.of("casual"), null);
        return new OutfitSuggestion(List.of(item), Occasion.WORK, score, "Lý do hệ thống " + score);
    }

    final List<OutfitSuggestion> candidates = List.of(suggestion("DRESS", 0.9), suggestion("TOP", 0.8), suggestion("DRESS", 0.7));

    @Test
    void usesAiOrderAndReason() {
        var result = ClaudeOutfitAdvisor.apply(new Picks(List.of(new Pick(2, "Váy nhẹ, hợp đi làm"), new Pick(0, "Thanh lịch"))), candidates, 2);
        assertThat(result).extracting(OutfitSuggestion::reason).containsExactly("Váy nhẹ, hợp đi làm", "Thanh lịch");
        assertThat(result.getFirst().items()).isEqualTo(candidates.get(2).items());
    }

    @Test
    void ignoresInvalidAndDuplicateIndexesAndFillsTheRest() {
        var result = ClaudeOutfitAdvisor.apply(new Picks(List.of(new Pick(7, "x"), new Pick(1, "Ok"), new Pick(1, "trùng"))), candidates, 3);
        assertThat(result).hasSize(3);
        assertThat(result.get(0).reason()).isEqualTo("Ok");
        assertThat(result.get(1)).isEqualTo(candidates.get(0));
        assertThat(result.get(2)).isEqualTo(candidates.get(2));
    }

    @Test
    void emptyAnswerFallsBackToScoreOrder() {
        assertThat(ClaudeOutfitAdvisor.apply(new Picks(null), candidates, 2)).containsExactly(candidates.get(0), candidates.get(1));
    }

    @Test
    void promptListsEveryCandidateWithIndex() {
        String prompt = ClaudeOutfitAdvisor.prompt(Occasion.WORK, candidates, 2);
        assertThat(prompt).contains("Dịp: đi làm", "#0: DRESS (white; casual)", "#2:", "Chọn tối đa 2");
    }
}
