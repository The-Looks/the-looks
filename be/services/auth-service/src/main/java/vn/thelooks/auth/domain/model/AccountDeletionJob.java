package vn.thelooks.auth.domain.model;

import java.time.Instant;
import java.util.UUID;

public record AccountDeletionJob(UUID targetId, UUID actorId, String step, String status, String lastError,
        Instant createdAt, Instant updatedAt) {}
