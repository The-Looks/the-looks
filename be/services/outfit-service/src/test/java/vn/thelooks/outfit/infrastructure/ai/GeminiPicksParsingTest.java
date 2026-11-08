package vn.thelooks.outfit.infrastructure.ai;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class GeminiPicksParsingTest {

    @Test
    void acceptsTheObjectFormAndABareArray() {
        var mapper = new ObjectMapper();
        assertThat(GeminiOutfitAdvisor.parse(mapper, "{\"picks\":[{\"index\":1,\"reason\":\"hợp\"}]}").picks()).hasSize(1);
        assertThat(GeminiOutfitAdvisor.parse(mapper, "[{\"index\":1,\"reason\":\"hợp\"}]").picks().getFirst().index()).isEqualTo(1);
    }
}
