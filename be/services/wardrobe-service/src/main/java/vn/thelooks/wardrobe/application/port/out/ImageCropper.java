package vn.thelooks.wardrobe.application.port.out;

import vn.thelooks.wardrobe.domain.model.BoundingBox;

/** Chuẩn hoá ảnh người dùng gửi và cắt từng món. Cài đặt đầu tiên: javax.imageio có sẵn trong JDK. */
public interface ImageCropper {

    /** Cạnh dài tối đa sau khi thu nhỏ: đủ rõ để AI nhận diện, ít token, ảnh món đồ vẫn nét. */
    int MAX_SIDE = 1568;

    /**
     * Đọc ảnh, xoay đúng chiều theo EXIF (ảnh chụp điện thoại), thu nhỏ về {@link #MAX_SIDE}, lưu lại thành JPEG.
     * AI và bước cắt dùng cùng ảnh này nên toạ độ khung luôn khớp.
     *
     * @throws vn.thelooks.wardrobe.domain.exception.InvalidImageException không đọc được ảnh
     */
    NormalizedImage normalize(byte[] image, String contentType);

    /** @return ảnh JPEG của riêng món đó (khung nới thêm 5% mỗi phía) */
    byte[] crop(NormalizedImage image, BoundingBox box);

    record NormalizedImage(byte[] jpeg, int width, int height) {
    }
}
