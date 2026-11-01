package vn.thelooks.wardrobe.infrastructure.storage;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import vn.thelooks.wardrobe.application.port.out.ImageStorage;

/**
 * Lưu ảnh trong thư mục trên máy chủ, phục vụ qua GET /api/public/wardrobe/images/{key}.
 * Khoá gồm 2 UUID ngẫu nhiên nên không đoán được. Dùng cho dev; production dùng Cloudinary.
 */
@Component
@ConditionalOnProperty(name = "thelooks.storage.provider", havingValue = "local", matchIfMissing = true)
class LocalImageStorage implements ImageStorage {

    /** {ownerId}/{uuid}.jpg — kiểm tra trước khi đụng tới ổ đĩa để không thể đi ra ngoài thư mục ảnh. */
    static final Pattern KEY = Pattern.compile("[0-9a-f-]{36}/[0-9a-f-]{36}\\.jpg");

    private final Path dir;
    private final String publicBaseUrl;

    LocalImageStorage(@Value("${thelooks.storage.local-dir}") String dir,
            @Value("${thelooks.storage.public-base-url}") String publicBaseUrl) {
        this.dir = Path.of(dir).toAbsolutePath().normalize();
        this.publicBaseUrl = publicBaseUrl.replaceAll("/+$", "");
    }

    @Override
    public String store(UUID ownerId, byte[] content, String contentType) {
        String key = ownerId + "/" + UUID.randomUUID() + ".jpg";
        try {
            Path file = dir.resolve(key);
            Files.createDirectories(file.getParent());
            Files.write(file, content);
            return key;
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    @Override
    public URI url(String key, Duration validity) {
        return URI.create(publicBaseUrl + "/api/public/wardrobe/images/" + key);
    }

    @Override
    public void delete(String key) {
        if (KEY.matcher(key).matches()) {
            try {
                Files.deleteIfExists(dir.resolve(key));
            } catch (IOException e) {
                throw new UncheckedIOException(e);
            }
        }
    }

    @Override
    public Optional<byte[]> read(String key) {
        if (!KEY.matcher(key).matches()) {
            return Optional.empty();
        }
        Path file = dir.resolve(key).normalize();
        try {
            return file.startsWith(dir) && Files.isRegularFile(file) ? Optional.of(Files.readAllBytes(file)) : Optional.empty();
        } catch (IOException e) {
            return Optional.empty();
        }
    }
}
