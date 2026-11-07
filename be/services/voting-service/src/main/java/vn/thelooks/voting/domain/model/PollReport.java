package vn.thelooks.voting.domain.model;

import java.time.Instant;
import java.util.UUID;

public record PollReport(UUID id, String pollCode, String question, String reason, String status, Instant createdAt) {}
