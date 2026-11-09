package vn.thelooks.wardrobe.infrastructure.image;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import vn.thelooks.wardrobe.domain.exception.InvalidImageException;
import vn.thelooks.wardrobe.domain.model.BoundingBox;

class ImageIoImageCropperTest {

    final ImageIoImageCropper cropper = new ImageIoImageCropper();

    /** Ảnh ngang 400x200: nửa trái đỏ, nửa phải xanh. */
    static byte[] jpeg(int w, int h) throws Exception {
        var img = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                img.setRGB(x, y, x < w / 2 ? Color.RED.getRGB() : Color.BLUE.getRGB());
            }
        }
        var out = new ByteArrayOutputStream();
        ImageIO.write(img, "jpg", out);
        return out.toByteArray();
    }

    /** Chèn segment APP1 EXIF (big-endian) với Orientation = value ngay sau SOI. */
    static byte[] withOrientation(byte[] jpeg, int value) {
        byte[] tiff = {'M', 'M', 0, 42, 0, 0, 0, 8, 0, 1, 0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, (byte) value, 0, 0, 0, 0, 0, 0};
        byte[] exif = new byte[6 + tiff.length];
        System.arraycopy(new byte[] {'E', 'x', 'i', 'f', 0, 0}, 0, exif, 0, 6);
        System.arraycopy(tiff, 0, exif, 6, tiff.length);
        int len = exif.length + 2;
        byte[] out = new byte[jpeg.length + 4 + exif.length];
        out[0] = (byte) 0xFF;
        out[1] = (byte) 0xD8;
        out[2] = (byte) 0xFF;
        out[3] = (byte) 0xE1;
        out[4] = (byte) (len >> 8);
        out[5] = (byte) len;
        System.arraycopy(exif, 0, out, 6, exif.length);
        System.arraycopy(jpeg, 2, out, 6 + exif.length, jpeg.length - 2);
        return out;
    }

    @Test
    void readsExifOrientation() throws Exception {
        assertThat(ExifOrientation.read(jpeg(40, 20))).isEqualTo(1);
        assertThat(ExifOrientation.read(withOrientation(jpeg(40, 20), 6))).isEqualTo(6);
        assertThat(ExifOrientation.read(new byte[] {1, 2, 3})).isEqualTo(1);
    }

    @Test
    void phonePhotoIsRotatedUpright() throws Exception {
        var normalized = cropper.normalize(withOrientation(jpeg(400, 200), 6), "image/jpeg");
        assertThat(normalized.width()).isEqualTo(200);
        assertThat(normalized.height()).isEqualTo(400);
        var img = ImageIO.read(new ByteArrayInputStream(normalized.jpeg()));
        // Xoay 90° theo chiều kim đồng hồ: nửa trái (đỏ) lên trên
        assertThat(new Color(img.getRGB(100, 50)).getRed()).isGreaterThan(200);
        assertThat(new Color(img.getRGB(100, 350)).getBlue()).isGreaterThan(200);
    }

    @Test
    void largePhotosAreScaledDown() throws Exception {
        var normalized = cropper.normalize(jpeg(3200, 1600), "image/jpeg");
        assertThat(normalized.width()).isEqualTo(1568);
        assertThat(normalized.height()).isEqualTo(784);
    }

    @Test
    void cropsOneItemWithPadding() throws Exception {
        var normalized = cropper.normalize(jpeg(400, 200), "image/jpeg");
        byte[] crop = cropper.crop(normalized, new BoundingBox(0.5, 0, 0.5, 1));
        var img = ImageIO.read(new ByteArrayInputStream(crop));
        assertThat(img.getWidth()).isEqualTo(224); // 200px + 12% của cạnh về phía trái (phía phải đã chạm mép)
        assertThat(img.getHeight()).isEqualTo(200);
    }

    @Test
    void rejectsFilesThatAreNotImages() {
        assertThatThrownBy(() -> cropper.normalize("not an image".getBytes(), "image/jpeg"))
                .isInstanceOf(InvalidImageException.class);
    }
}
