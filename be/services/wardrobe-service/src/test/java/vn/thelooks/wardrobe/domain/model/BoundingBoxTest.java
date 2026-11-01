package vn.thelooks.wardrobe.domain.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

import org.junit.jupiter.api.Test;

class BoundingBoxTest {

    @Test
    void clampsCoordinatesFromAiIntoTheImage() {
        var box = new BoundingBox(-0.1, 0.8, 0.5, 0.5);
        assertThat(box.x()).isZero();
        assertThat(box.height()).isCloseTo(0.2, within(1e-9));
        assertThat(new BoundingBox(Double.NaN, 0, 2, 1).width()).isEqualTo(1);
    }

    @Test
    void tinyBoxesAreNoise() {
        assertThat(new BoundingBox(0.5, 0.5, 0.05, 0.05).tooSmall()).isTrue();
        assertThat(new BoundingBox(0.1, 0.1, 0.3, 0.4).tooSmall()).isFalse();
    }

    @Test
    void overlapOfSameBoxIsOneAndOfSeparateBoxesIsZero() {
        var shirt = new BoundingBox(0.1, 0.1, 0.4, 0.4);
        assertThat(shirt.overlap(shirt)).isCloseTo(1, within(1e-9));
        assertThat(shirt.overlap(new BoundingBox(0.6, 0.6, 0.3, 0.3))).isZero();
    }

    @Test
    void pixelsIncludePaddingButStayInsideTheImage() {
        // Áo ở nửa trên ảnh 1000x2000, nới 5% mỗi cạnh
        var rect = new BoundingBox(0.2, 0.0, 0.6, 0.5).toPixels(1000, 2000, 0.05);
        assertThat(rect).isEqualTo(new BoundingBox.PixelRect(170, 0, 660, 1050));
        var whole = BoundingBox.whole().toPixels(640, 480, 0.05);
        assertThat(whole).isEqualTo(new BoundingBox.PixelRect(0, 0, 640, 480));
    }
}
