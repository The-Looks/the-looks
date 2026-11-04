package vn.thelooks.auth.application.port.out;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface AdminUserQueryPort {
    record UserRow(UUID id, String username, String email, String status, boolean emailVerified, Instant createdAt) {}
    record PageResult(List<UserRow> items, long total, int page, int size) {}

    PageResult list(int page, int size, String search);
}
