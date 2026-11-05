package vn.thelooks.auth.application.port.in;

import vn.thelooks.auth.domain.model.User;

public interface RegisterUseCase {

    /** Ném lỗi nếu email đã tồn tại. Người dùng mới luôn được gán role USER. */
    User register(RegisterCommand command);

    /** Phiên bản Điều khoản + Chính sách quyền riêng tư hiện hành (trùng với LEGAL_VERSION ở web). */
    String TERMS_VERSION = "2026-11-05";

    record RegisterCommand(String email, String password, String username) {
    }
}
