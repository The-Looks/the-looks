package vn.thelooks.outfit.infrastructure.ai;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class GeminiOutfitAdvisorTest {

    @Test
    void costFollowsTheModelActuallyCalled() {
        assertThat(GeminiOutfitAdvisor.pricePerMillion("gemini-3.5-flash-lite")).containsExactly(0.30, 2.50);
        assertThat(GeminiOutfitAdvisor.pricePerMillion("gemini-3.1-flash-lite")).containsExactly(0.25, 1.50);
        assertThat(GeminiOutfitAdvisor.pricePerMillion("gemini-3.8-flash")).containsExactly(0.75, 3.75);
        assertThat(GeminiOutfitAdvisor.pricePerMillion("gemini-9-unknown")).containsExactly(0.75, 3.75);
    }
}
