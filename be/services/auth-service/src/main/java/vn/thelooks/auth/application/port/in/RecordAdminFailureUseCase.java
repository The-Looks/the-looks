package vn.thelooks.auth.application.port.in;

import java.util.UUID;

public interface RecordAdminFailureUseCase {
    void record(UUID actor, String target, String action, RuntimeException failure);
}
