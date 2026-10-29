package vn.thelooks.identity.application.usecase;

import vn.thelooks.identity.domain.model.User;

public interface RegisterUseCase {

    /** Ném lỗi nếu email đã tồn tại. Người dùng mới luôn có Role.USER. */
    User register(RegisterCommand command);

    record RegisterCommand(String email, String password, String displayName) {
    }
}
