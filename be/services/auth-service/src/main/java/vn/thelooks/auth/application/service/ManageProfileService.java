package vn.thelooks.auth.application.service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.UUID;
import javax.imageio.ImageIO;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import vn.thelooks.auth.application.port.in.ManageProfileUseCase;
import vn.thelooks.auth.application.port.out.UserProfileRepositoryPort;
import vn.thelooks.auth.domain.model.UserProfile;

@Service
class ManageProfileService implements ManageProfileUseCase {
    private static final int MAX_AVATAR_BYTES = 2 * 1024 * 1024;
    private final UserProfileRepositoryPort profiles;

    ManageProfileService(UserProfileRepositoryPort profiles) { this.profiles = profiles; }

    public UserProfile get(UUID userId) { return profiles.get(userId); }

    public UserProfile update(UUID userId, String username, String city) {
        String name = username == null ? "" : username.trim();
        String location = city == null ? null : city.trim();
        if (name.isEmpty() || name.length() > 60 || (location != null && location.length() > 120))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên hoặc thành phố không hợp lệ");
        return profiles.update(userId, name, location == null || location.isEmpty() ? null : location);
    }

    public UserProfile uploadAvatar(UUID userId, byte[] bytes) {
        if (bytes == null || bytes.length == 0 || bytes.length > MAX_AVATAR_BYTES)
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Ảnh đại diện phải nhỏ hơn 2 MB");
        String contentType;
        if (bytes.length >= 8 && (bytes[0] & 0xff) == 0x89 && bytes[1] == 'P' && bytes[2] == 'N'
                && bytes[3] == 'G' && bytes[4] == 13 && bytes[5] == 10 && bytes[6] == 26 && bytes[7] == 10)
            contentType = "image/png";
        else if (bytes.length >= 3 && (bytes[0] & 0xff) == 0xff && (bytes[1] & 0xff) == 0xd8
                && (bytes[2] & 0xff) == 0xff) contentType = "image/jpeg";
        else throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Chỉ nhận ảnh PNG hoặc JPEG");
        try (var stream = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
            var readers = ImageIO.getImageReaders(stream);
            if (!readers.hasNext()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ảnh không hợp lệ");
            var reader = readers.next();
            try {
                reader.setInput(stream);
                if (reader.getWidth(0) > 4096 || reader.getHeight(0) > 4096
                        || reader.getWidth(0) < 1 || reader.getHeight(0) < 1)
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kích thước ảnh không hợp lệ");
                if (reader.read(0) == null)
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ảnh không hợp lệ");
            } finally { reader.dispose(); }
        } catch (IOException error) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ảnh không hợp lệ", error);
        }
        return profiles.saveAvatar(userId, bytes, contentType);
    }

    public UserProfile removeAvatar(UUID userId) { return profiles.removeAvatar(userId); }
    public Avatar avatar(UUID userId) { return profiles.avatar(userId); }
}
