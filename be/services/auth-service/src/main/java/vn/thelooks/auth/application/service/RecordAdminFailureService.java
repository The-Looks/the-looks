package vn.thelooks.auth.application.service;

import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import vn.thelooks.auth.application.port.in.RecordAdminFailureUseCase;
import vn.thelooks.auth.application.port.out.AdminAuditRepositoryPort;

@Service
class RecordAdminFailureService implements RecordAdminFailureUseCase {
    private static final Logger log = LoggerFactory.getLogger(RecordAdminFailureService.class);
    private final AdminAuditRepositoryPort repository;
    RecordAdminFailureService(AdminAuditRepositoryPort repository) { this.repository = repository; }

    public void record(UUID actor, String target, String action, RuntimeException failure) {
        String detail = failure instanceof ResponseStatusException status && status.getReason() != null
                ? status.getReason() : failure.getClass().getSimpleName();
        try {
            repository.recordFailure(actor, target, action, detail.substring(0, Math.min(500, detail.length())));
        } catch (RuntimeException auditError) {
            log.error("Không ghi được nhật ký thất bại cho {} trên {}", action, target, auditError);
        }
    }
}
