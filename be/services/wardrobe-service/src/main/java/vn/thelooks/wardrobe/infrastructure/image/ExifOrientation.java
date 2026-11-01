package vn.thelooks.wardrobe.infrastructure.image;

/**
 * Đọc thẻ Orientation (0x0112) trong EXIF của JPEG. Ảnh chụp điện thoại thường lưu nằm ngang
 * kèm thẻ này; ImageIO bỏ qua EXIF nên phải tự xoay.
 *
 * @see <a href="https://www.cipa.jp/std/documents/e/DC-008-2012_E.pdf">EXIF 2.3, mục 4.6.4</a>
 */
final class ExifOrientation {

    private ExifOrientation() {
    }

    /** @return 1..8; 1 = đúng chiều (cũng là giá trị khi không có EXIF hoặc không đọc được) */
    static int read(byte[] jpeg) {
        try {
            if (jpeg.length < 4 || (jpeg[0] & 0xFF) != 0xFF || (jpeg[1] & 0xFF) != 0xD8) {
                return 1;
            }
            int pos = 2;
            while (pos + 4 <= jpeg.length) {
                if ((jpeg[pos] & 0xFF) != 0xFF) {
                    return 1;
                }
                int marker = jpeg[pos + 1] & 0xFF;
                if (marker == 0xDA || marker == 0xD9) {
                    return 1; // tới dữ liệu ảnh mà chưa thấy EXIF
                }
                int length = ((jpeg[pos + 2] & 0xFF) << 8) | (jpeg[pos + 3] & 0xFF);
                int body = pos + 4;
                if (marker == 0xE1 && length >= 8 && body + 6 <= jpeg.length
                        && jpeg[body] == 'E' && jpeg[body + 1] == 'x' && jpeg[body + 2] == 'i' && jpeg[body + 3] == 'f') {
                    return fromTiff(jpeg, body + 6, Math.min(jpeg.length, pos + 2 + length));
                }
                pos += 2 + length;
            }
        } catch (RuntimeException e) {
            // EXIF hỏng: coi như ảnh đã đúng chiều
        }
        return 1;
    }

    private static int fromTiff(byte[] b, int tiff, int end) {
        boolean little = b[tiff] == 'I' && b[tiff + 1] == 'I';
        int ifd = tiff + (int) read32(b, tiff + 4, little);
        int count = read16(b, ifd, little);
        for (int i = 0; i < count; i++) {
            int entry = ifd + 2 + i * 12;
            if (entry + 12 > end) {
                break;
            }
            if (read16(b, entry, little) == 0x0112) {
                int value = read16(b, entry + 8, little);
                return value >= 1 && value <= 8 ? value : 1;
            }
        }
        return 1;
    }

    private static int read16(byte[] b, int p, boolean little) {
        return little ? (b[p] & 0xFF) | ((b[p + 1] & 0xFF) << 8) : ((b[p] & 0xFF) << 8) | (b[p + 1] & 0xFF);
    }

    private static long read32(byte[] b, int p, boolean little) {
        return little
                ? (b[p] & 0xFFL) | ((b[p + 1] & 0xFFL) << 8) | ((b[p + 2] & 0xFFL) << 16) | ((b[p + 3] & 0xFFL) << 24)
                : ((b[p] & 0xFFL) << 24) | ((b[p + 1] & 0xFFL) << 16) | ((b[p + 2] & 0xFFL) << 8) | (b[p + 3] & 0xFFL);
    }
}
