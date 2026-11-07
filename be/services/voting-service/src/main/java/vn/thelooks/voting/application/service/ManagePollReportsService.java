package vn.thelooks.voting.application.service;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import vn.thelooks.voting.application.port.in.ManagePollReportsUseCase;
import vn.thelooks.voting.application.port.in.RecordPollDecisionFailureUseCase;
import vn.thelooks.voting.application.port.out.PollReportRepositoryPort;
import vn.thelooks.voting.domain.model.AdminPollSummary;
import vn.thelooks.voting.domain.model.PollModerationAudit;
import vn.thelooks.voting.domain.model.PollReport;

@Service
class ManagePollReportsService implements ManagePollReportsUseCase, RecordPollDecisionFailureUseCase {
    private static final Logger log = LoggerFactory.getLogger(ManagePollReportsService.class);
    private final PollReportRepositoryPort repository;
    ManagePollReportsService(PollReportRepositoryPort repository) { this.repository = repository; }
    public void report(String code, String reason, String voterId, String ip) { repository.report(code, reason, voterId, ip); }
    public List<PollReport> reports(String status) { return repository.reports(status); }
    public PollReport decide(UUID actorId, UUID reportId, String status) { return repository.decide(actorId, reportId, status); }
    public void record(UUID actorId, UUID reportId, String action) {
        try {
            repository.recordDecisionFailure(actorId, reportId, action);
        } catch (RuntimeException error) {
            log.error("Không ghi được nhật ký xử lý báo cáo thất bại {}", reportId, error);
        }
    }
    public List<PollModerationAudit> audit() { return repository.audit(); }
    public AdminPollSummary summary(UUID userId) { return repository.summary(userId); }
    public void delete(UUID userId) { repository.delete(userId); }
}
