package vn.thelooks.outfit.infrastructure.ai;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;
import vn.thelooks.outfit.application.port.out.OutfitAiAdvisor;
import vn.thelooks.outfit.application.port.out.OutfitAiAdvisor.Advice;
import vn.thelooks.outfit.domain.model.AiUsage;
import vn.thelooks.outfit.domain.model.ClosetItem;
import vn.thelooks.outfit.domain.model.OutfitSuggestion;
import vn.thelooks.outfit.domain.model.StyleProfile;

class GeminiOutfitAdvisorTest {

    @Test
    void costFollowsTheModelActuallyCalled() {
        assertThat(GeminiOutfitAdvisor.pricePerMillion("gemini-3.5-flash-lite")).containsExactly(0.30, 2.50);
        assertThat(GeminiOutfitAdvisor.pricePerMillion("gemini-3.1-flash-lite")).containsExactly(0.25, 1.50);
        assertThat(GeminiOutfitAdvisor.pricePerMillion("gemini-3.8-flash")).containsExactly(0.75, 3.75);
        assertThat(GeminiOutfitAdvisor.pricePerMillion("gemini-9-unknown")).containsExactly(0.75, 3.75);
    }

    static final List<OutfitSuggestion> CANDIDATES = List.of(new OutfitSuggestion(
            List.of(new ClosetItem(UUID.randomUUID(), "TOP", null, null, null, null)), null, 0.8, "điểm"));

    @Test
    void claudeAnswersFirst() {
        var claudePick = new Advice(CANDIDATES, new AiUsage("claude-haiku-5-5", 10, 5, 0.0001));
        OutfitAiAdvisor claude = (occasion, candidates, taste, limit) -> claudePick;
        var advisor = new GeminiOutfitAdvisor(new ObjectMapper(), "", "g1", "g2", claude);
        assertThat(advisor.choose(null, CANDIDATES, StyleProfile.NONE, 1)).isSameAs(claudePick);
    }

    @Test
    void whenClaudeFailsAndNoGeminiKeyTheScoredOrderIsStillReturned() {
        OutfitAiAdvisor broken = (occasion, candidates, taste, limit) -> Advice.withoutAi(candidates, limit);
        var advice = new GeminiOutfitAdvisor(new ObjectMapper(), "", "g1", "g2", broken).choose(null, CANDIDATES, StyleProfile.NONE, 1);
        assertThat(advice.usage()).isNull();
        assertThat(advice.suggestions()).hasSize(1);
    }
}
