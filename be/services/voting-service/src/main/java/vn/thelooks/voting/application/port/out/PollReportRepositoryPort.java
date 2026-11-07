package vn.thelooks.voting.application.port.out;

import java.util.List;
import java.util.UUID;
import vn.thelooks.voting.domain.model.AdminPollSummary;
import vn.thelooks.voting.domain.model.PollModerationAudit;
import vn.thelooks.voting.domain.model.PollReport;

public interface PollReportRepositoryPort {
    void report(String code, String reason, String voterId, String ip);
    List<PollReport> reports(String status);
    PollReport decide(UUID actorId, UUID reportId, String status);
    void recordDecisionFailure(UUID actorId, UUID reportId, String action);
    List<PollModerationAudit> audit();
    AdminPollSummary summary(UUID userId);
    void delete(UUID userId);
}
