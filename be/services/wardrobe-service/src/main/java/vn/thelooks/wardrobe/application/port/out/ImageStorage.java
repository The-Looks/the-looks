package vn.thelooks.wardrobe.application.port.out;

import java.net.URI;
import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

/** Lưu ảnh từng món (JPEG đã cắt). Cài đặt: Cloudinary, hoặc thư mục local khi dev. */
public interface ImageStorage {

    /** @return khoá ảnh để lưu vào DB */
    String store(UUID ownerId, byte[] content, String contentType);

    /** URL để app tải ảnh; null khi ảnh không còn (món cũ lưu ở nơi đã bị xoá). */
    URI url(String key, Duration validity);

    void delete(String key);

    /** Đọc lại ảnh để phục vụ qua API; chỉ bản lưu local cần, Cloudinary phục vụ trực tiếp. */
    default Optional<byte[]> read(String key) {
        return Optional.empty();
    }
}
