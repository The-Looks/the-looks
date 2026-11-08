package vn.thelooks.wardrobe.infrastructure.ai;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class GeminiResponseParsingTest {

    static final String GARMENT = "{\"category\":\"TOP\",\"colors\":[\"white\"],\"box\":{\"x\":0.1,\"y\":0.1,\"width\":0.5,\"height\":0.5},\"confidence\":0.9}";

    @Test
    void acceptsTheObjectFormAndABareArray() {
        var mapper = new ObjectMapper();
        assertThat(GeminiGarmentDetector.parse(mapper, "{\"garments\":[" + GARMENT + "]}").garments()).hasSize(1);
        assertThat(GeminiGarmentDetector.parse(mapper, "[" + GARMENT + "]").garments()).hasSize(1);
    }
}
