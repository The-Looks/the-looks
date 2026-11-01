package vn.thelooks.wardrobe.domain.model;

/**
 * Vùng chứa một món đồ trong ảnh, toạ độ chuẩn hoá 0..1 (góc trên bên trái là 0,0), không phụ thuộc kích thước ảnh.
 * AI trả về toạ độ gần đúng nên mọi giá trị được kẹp vào khung ảnh.
 */
public record BoundingBox(double x, double y, double width, double height) {

    /** Món chiếm dưới 1% diện tích ảnh coi là nhiễu (cúc áo, góc đồ khác lọt vào ảnh). */
    public static final double MIN_AREA = 0.01;

    public BoundingBox {
        x = clamp(x);
        y = clamp(y);
        width = Math.min(clamp(width), 1 - x);
        height = Math.min(clamp(height), 1 - y);
    }

    /** Cả ảnh: dùng khi ảnh chỉ có một món và AI không trả về khung. */
    public static BoundingBox whole() {
        return new BoundingBox(0, 0, 1, 1);
    }

    public double area() {
        return width * height;
    }

    public boolean tooSmall() {
        return area() < MIN_AREA;
    }

    /** Tỉ lệ giao trên hợp (0..1); > 0,6 coi như AI báo trùng một món hai lần. */
    public double overlap(BoundingBox other) {
        double ix = Math.max(0, Math.min(x + width, other.x + other.width) - Math.max(x, other.x));
        double iy = Math.max(0, Math.min(y + height, other.y + other.height) - Math.max(y, other.y));
        double intersection = ix * iy;
        double union = area() + other.area() - intersection;
        return union <= 0 ? 0 : intersection / union;
    }

    /**
     * Vùng cắt theo pixel, nới thêm {@code padding} (tỉ lệ cạnh) mỗi phía để khung gần đúng của AI không cắt mất mép đồ.
     */
    public PixelRect toPixels(int imageWidth, int imageHeight, double padding) {
        double px = width * padding, py = height * padding;
        int left = floor(Math.max(0, x - px) * imageWidth);
        int top = floor(Math.max(0, y - py) * imageHeight);
        int right = ceil(Math.min(1, x + width + px) * imageWidth);
        int bottom = ceil(Math.min(1, y + height + py) * imageHeight);
        return new PixelRect(left, top, Math.max(1, right - left), Math.max(1, bottom - top));
    }

    // Bỏ sai số dấu phẩy động (0.8 + 0.03 = 0.8300000000000001) để không lệch 1 pixel
    private static int floor(double v) {
        return (int) Math.floor(v + 1e-6);
    }

    private static int ceil(double v) {
        return (int) Math.ceil(v - 1e-6);
    }

    private static double clamp(double v) {
        return Double.isNaN(v) ? 0 : Math.max(0, Math.min(1, v));
    }

    public record PixelRect(int x, int y, int width, int height) {
    }
}
