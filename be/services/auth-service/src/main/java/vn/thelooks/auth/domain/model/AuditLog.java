package vn.thelooks.auth.domain.model;

import java.time.Instant;
import java.util.UUID;

public record AuditLog(UUID id, UUID actorId, String targetId, String action, String detail,
        String outcome, Instant createdAt) {}
