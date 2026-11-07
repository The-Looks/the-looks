package vn.thelooks.voting.presentation.controller;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.security.CurrentUser;
import vn.thelooks.voting.application.port.in.ManagePollReportsUseCase;
import vn.thelooks.voting.application.port.in.RecordPollDecisionFailureUseCase;
import vn.thelooks.voting.domain.model.AdminPollSummary;
import vn.thelooks.voting.domain.model.PollModerationAudit;
import vn.thelooks.voting.domain.model.PollReport;

@RestController
@RequestMapping("/api")
class PollReportsController {
    record ReportRequest(String reason) {}
    record Decision(String status) {}
    private final ManagePollReportsUseCase useCase;
    private final RecordPollDecisionFailureUseCase failures;
    PollReportsController(ManagePollReportsUseCase useCase, RecordPollDecisionFailureUseCase failures) {
        this.useCase = useCase;
        this.failures = failures;
    }

    @PostMapping("/public/polls/{code}/reports")
    @ResponseStatus(HttpStatus.CREATED)
    void report(@PathVariable String code, @RequestBody ReportRequest body,
            @CookieValue(name="vote_id", required=false) String voterId, HttpServletRequest request) {
        useCase.report(code, body.reason(), voterId, request.getRemoteAddr());
    }

    @GetMapping("/admin/polls/reports")
    @PreAuthorize("hasAuthority('PERMISSION_REPORT_MODERATE')")
    List<PollReport> reports(@RequestParam(defaultValue="OPEN") String status) { return useCase.reports(status); }

    @PutMapping("/admin/polls/reports/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_REPORT_MODERATE')")
    PollReport decide(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id, @RequestBody Decision body) {
        try {
            return useCase.decide(CurrentUser.id(jwt), id, body.status());
        } catch (RuntimeException failure) {
            failures.record(CurrentUser.id(jwt), id, body == null ? "DECIDE" : body.status());
            throw failure;
        }
    }

    @GetMapping("/admin/polls/audit")
    @PreAuthorize("hasAuthority('PERMISSION_AUDIT_READ')")
    List<PollModerationAudit> audit() { return useCase.audit(); }

    @GetMapping("/admin/polls/users/{id}/data")
    @PreAuthorize("hasAuthority('PERMISSION_USER_MANAGE')")
    AdminPollSummary summary(@PathVariable UUID id) { return useCase.summary(id); }

    @DeleteMapping("/admin/polls/users/{id}/data")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('PERMISSION_USER_DELETE')")
    void delete(@PathVariable UUID id) { useCase.delete(id); }
}
