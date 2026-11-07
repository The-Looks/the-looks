package vn.thelooks.voting.domain.model;

import java.time.Instant;
import java.util.UUID;

public record PollModerationAudit(UUID id, UUID actorId, String pollCode, String action,
        String outcome, Instant createdAt) {}
