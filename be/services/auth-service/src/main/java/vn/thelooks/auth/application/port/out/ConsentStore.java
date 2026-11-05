package vn.thelooks.auth.application.port.out;

import java.time.Instant;
import java.util.UUID;

/** Lưu việc người dùng đồng ý một phiên bản Điều khoản + Chính sách quyền riêng tư. */
public interface ConsentStore {

    void record(UUID userId, String version, Instant acceptedAt);
}
