package vn.thelooks.auth.application.port.out;

import java.util.UUID;

public interface AdminAuditRepositoryPort {
    void recordFailure(UUID actor, String target, String action, String detail);
}
