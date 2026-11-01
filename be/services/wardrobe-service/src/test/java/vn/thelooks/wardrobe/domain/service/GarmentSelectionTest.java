package vn.thelooks.wardrobe.domain.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import vn.thelooks.wardrobe.domain.model.BoundingBox;
import vn.thelooks.wardrobe.domain.model.Category;
import vn.thelooks.wardrobe.domain.model.ClothingAttributes;
import vn.thelooks.wardrobe.domain.model.DetectedGarment;

class GarmentSelectionTest {

    static DetectedGarment garment(Category c, double x, double y, double size, double confidence) {
        var attrs = new ClothingAttributes(c, List.of("white"), null, Set.of(), Set.of());
        return new DetectedGarment(attrs, new BoundingBox(x, y, size, size), confidence);
    }

    final DetectedGarment shirt = garment(Category.TOP, 0.1, 0.0, 0.4, 0.95);
    final DetectedGarment jeans = garment(Category.BOTTOM, 0.1, 0.5, 0.4, 0.9);
    final DetectedGarment shoes = garment(Category.SHOES, 0.6, 0.8, 0.2, 0.8);

    @Test
    void outfitPhotoBecomesSeveralItemsBestFirst() {
        var result = GarmentSelection.select(List.of(shoes, shirt, jeans), null);
        assertThat(result.kept()).containsExactly(shirt, jeans, shoes);
        assertThat(result.skippedForLimit()).isZero();
    }

    @Test
    void dropsNoiseLowConfidenceAndDuplicates() {
        var button = garment(Category.ACCESSORY, 0.3, 0.3, 0.05, 0.9);
        var unsure = garment(Category.BAG, 0.7, 0.1, 0.2, 0.2);
        var sameShirtAgain = garment(Category.TOP, 0.12, 0.02, 0.4, 0.6);
        var result = GarmentSelection.select(List.of(shirt, button, unsure, sameShirtAgain), null);
        assertThat(result.kept()).containsExactly(shirt);
    }

    @Test
    void respectsRemainingSlotsOfThePlan() {
        var result = GarmentSelection.select(List.of(shirt, jeans, shoes), 2);
        assertThat(result.kept()).containsExactly(shirt, jeans);
        assertThat(result.skippedForLimit()).isEqualTo(1);
        assertThat(GarmentSelection.select(List.of(shirt), 0).kept()).isEmpty();
    }

    @Test
    void capsItemsPerImage() {
        List<DetectedGarment> many = new ArrayList<>();
        for (int i = 0; i < 12; i++) {
            many.add(garment(Category.TOP, (i % 4) * 0.25, (i / 4) * 0.33, 0.2, 0.9 - i * 0.01));
        }
        assertThat(GarmentSelection.select(many, null).kept()).hasSize(GarmentSelection.MAX_ITEMS_PER_IMAGE);
    }
}
