package vn.thelooks.auth.application.port.in;

import vn.thelooks.auth.domain.model.User;

public interface RegisterUseCase {

    /** Ném lỗi nếu email đã tồn tại. Người dùng mới luôn được gán role USER. */
    User register(RegisterCommand command);

    record RegisterCommand(String email, String password, String username) {
    }
}
