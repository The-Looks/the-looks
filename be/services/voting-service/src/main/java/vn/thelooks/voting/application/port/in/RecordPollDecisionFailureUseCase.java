package vn.thelooks.voting.application.port.in;

import java.util.UUID;

public interface RecordPollDecisionFailureUseCase {
    void record(UUID actorId, UUID reportId, String action);
}
