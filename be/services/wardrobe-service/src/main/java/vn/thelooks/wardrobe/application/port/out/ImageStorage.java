package vn.thelooks.wardrobe.application.port.out;

import java.net.URI;
import java.time.Duration;
import java.util.UUID;

/** Lưu ảnh. Cài đặt: S3/MinIO, hoặc thư mục local khi dev. */
public interface ImageStorage {

    /** @return khoá ảnh để lưu vào DB */
    String store(UUID ownerId, byte[] content, String contentType);

    /** URL tạm (presigned) để app tải ảnh. */
    URI url(String key, Duration validity);

    void delete(String key);
}
