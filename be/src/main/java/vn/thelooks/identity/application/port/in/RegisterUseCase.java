package vn.thelooks.identity.application.port.in;

import vn.thelooks.identity.domain.User;

public interface RegisterUseCase {

    /** Ném lỗi nếu email đã tồn tại. Người dùng mới luôn có Role.USER. */
    User register(RegisterCommand command);

    record RegisterCommand(String email, String password, String displayName) {
    }
}
