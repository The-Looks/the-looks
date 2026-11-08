package vn.thelooks.auth.application.port.out;

import java.util.UUID;
import vn.thelooks.auth.application.port.in.ManageProfileUseCase.Avatar;
import vn.thelooks.auth.domain.model.UserProfile;

public interface UserProfileRepositoryPort {
    UserProfile get(UUID userId);
    UserProfile update(UUID userId, String username, String city);
    UserProfile selectMascot(UUID userId, String mascotId);
    UserProfile saveAvatar(UUID userId, byte[] bytes, String contentType);
    UserProfile removeAvatar(UUID userId);
    Avatar avatar(UUID userId);
}
