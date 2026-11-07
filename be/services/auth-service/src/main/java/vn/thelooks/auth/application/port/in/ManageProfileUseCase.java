package vn.thelooks.auth.application.port.in;

import java.util.UUID;
import vn.thelooks.auth.domain.model.UserProfile;

public interface ManageProfileUseCase {
    UserProfile get(UUID userId);
    UserProfile update(UUID userId, String username, String city);
    UserProfile uploadAvatar(UUID userId, byte[] bytes);
    UserProfile removeAvatar(UUID userId);
    Avatar avatar(UUID userId);

    record Avatar(byte[] bytes, String contentType) {}
}
