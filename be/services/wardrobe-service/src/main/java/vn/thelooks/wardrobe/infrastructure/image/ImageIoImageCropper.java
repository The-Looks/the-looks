package vn.thelooks.wardrobe.infrastructure.image;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import javax.imageio.ImageIO;
import org.springframework.stereotype.Component;
import vn.thelooks.wardrobe.application.port.out.ImageCropper;
import vn.thelooks.wardrobe.domain.exception.InvalidImageException;
import vn.thelooks.wardrobe.domain.model.BoundingBox;

/** Chuẩn hoá và cắt ảnh bằng javax.imageio (có sẵn trong JDK, đọc được JPEG và PNG). */
@Component
class ImageIoImageCropper implements ImageCropper {

    static final double CROP_PADDING = 0.05;

    @Override
    public NormalizedImage normalize(byte[] image, String contentType) {
        BufferedImage source;
        try {
            source = ImageIO.read(new ByteArrayInputStream(image));
        } catch (IOException | RuntimeException e) {
            throw new InvalidImageException("Không đọc được ảnh, hãy chọn ảnh JPEG hoặc PNG khác");
        }
        if (source == null) {
            throw new InvalidImageException("Không đọc được ảnh, hãy chọn ảnh JPEG hoặc PNG khác");
        }
        int orientation = "image/jpeg".equalsIgnoreCase(contentType) ? ExifOrientation.read(image) : 1;
        BufferedImage upright = orient(resize(source, MAX_SIDE), orientation);
        return new NormalizedImage(jpeg(upright), upright.getWidth(), upright.getHeight());
    }

    @Override
    public byte[] crop(NormalizedImage image, BoundingBox box) {
        try {
            BufferedImage source = ImageIO.read(new ByteArrayInputStream(image.jpeg()));
            BoundingBox.PixelRect r = box.toPixels(source.getWidth(), source.getHeight(), CROP_PADDING);
            return jpeg(source.getSubimage(r.x(), r.y(), r.width(), r.height()));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    /** Thu nhỏ để cạnh dài ≤ maxSide; nền trắng cho ảnh PNG trong suốt (JPEG không có kênh alpha). */
    static BufferedImage resize(BufferedImage src, int maxSide) {
        double scale = Math.min(1.0, (double) maxSide / Math.max(src.getWidth(), src.getHeight()));
        int w = Math.max(1, (int) Math.round(src.getWidth() * scale));
        int h = Math.max(1, (int) Math.round(src.getHeight() * scale));
        BufferedImage out = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = out.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, w, h);
        g.drawImage(src, 0, 0, w, h, null);
        g.dispose();
        return out;
    }

    /** Áp dụng EXIF Orientation 1..8 (lật / xoay) để ảnh đứng đúng chiều. */
    static BufferedImage orient(BufferedImage src, int orientation) {
        if (orientation <= 1 || orientation > 8) {
            return src;
        }
        int w = src.getWidth(), h = src.getHeight();
        boolean swap = orientation >= 5;
        BufferedImage out = new BufferedImage(swap ? h : w, swap ? w : h, BufferedImage.TYPE_INT_RGB);
        for (int y = 0; y < out.getHeight(); y++) {
            for (int x = 0; x < out.getWidth(); x++) {
                int sx, sy;
                switch (orientation) {
                    case 2 -> { sx = w - 1 - x; sy = y; }
                    case 3 -> { sx = w - 1 - x; sy = h - 1 - y; }
                    case 4 -> { sx = x; sy = h - 1 - y; }
                    case 5 -> { sx = y; sy = x; }
                    case 6 -> { sx = y; sy = h - 1 - x; }
                    case 7 -> { sx = w - 1 - y; sy = h - 1 - x; }
                    default -> { sx = w - 1 - y; sy = x; } // 8
                }
                out.setRGB(x, y, src.getRGB(sx, sy));
            }
        }
        return out;
    }

    private static byte[] jpeg(BufferedImage img) {
        try (var out = new ByteArrayOutputStream()) {
            ImageIO.write(img, "jpg", out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
