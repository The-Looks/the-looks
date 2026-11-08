package vn.thelooks.wardrobe.infrastructure.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;
import vn.thelooks.wardrobe.application.port.out.GarmentDetector;
import vn.thelooks.wardrobe.domain.model.BoundingBox;
import vn.thelooks.wardrobe.domain.model.Category;
import vn.thelooks.wardrobe.domain.model.ClothingAttributes;
import vn.thelooks.wardrobe.domain.model.DetectedGarment;

class ClaudeFirstDetectionTest {

    static final List<DetectedGarment> SHIRT = List.of(new DetectedGarment(
            new ClothingAttributes(Category.TOP, List.of("white"), null, Set.of(), Set.of()), new BoundingBox(0, 0, 1, 1), 0.9));

    @Test
    void claudeDetectsFirst() {
        GarmentDetector claude = (image, type) -> SHIRT;
        assertThat(new GeminiGarmentDetector(new ObjectMapper(), "", "g1", "g2", claude).detect(new byte[] {1}, "image/jpeg"))
                .isSameAs(SHIRT);
    }

    @Test
    void claudeFailureIsReportedWhenNoGeminiKeyIsSet() {
        GarmentDetector outOfCredit = (image, type) -> { throw new IllegalStateException("credit balance is too low"); };
        assertThatThrownBy(() -> new GeminiGarmentDetector(new ObjectMapper(), "", "g1", "g2", outOfCredit)
                .detect(new byte[] {1}, "image/jpeg")).hasMessageContaining("credit");
    }
}
