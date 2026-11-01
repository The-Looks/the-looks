package vn.thelooks.wardrobe.application.port.out;

import vn.thelooks.wardrobe.domain.model.BoundingBox;

/**
 * Cắt một món ra khỏi ảnh gốc (dùng {@code BoundingBox.toPixels} với padding ~5%).
 * Cài đặt đầu tiên: javax.imageio có sẵn trong JDK. Xoá nền có thể thêm sau trong cùng adapter.
 */
public interface ImageCropper {

    /** @return ảnh JPEG của riêng món đó */
    byte[] crop(byte[] image, String contentType, BoundingBox box);
}
