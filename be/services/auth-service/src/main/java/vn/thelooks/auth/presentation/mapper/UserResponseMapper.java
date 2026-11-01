package vn.thelooks.auth.presentation.mapper;

import vn.thelooks.auth.domain.model.User;
import vn.thelooks.auth.presentation.response.UserResponse;

public final class UserResponseMapper {

    private UserResponseMapper() {
    }

    public static UserResponse from(User user) {
        return new UserResponse(user.id(), user.email(), user.username(),
                user.roles().stream().sorted().toList(), user.createdAt());
    }
}
