package vn.thelooks.billing.application.port.out;

import java.util.Optional;

/** Email của người dùng đang gọi API (hỏi auth-service bằng JWT của chính họ). */
public interface ContactEmailReader {

    /** Rỗng khi không hỏi được auth-service; không được làm hỏng việc thanh toán. */
    Optional<String> currentUserEmail();
}
