package vn.thelooks.voting.infrastructure.persistence.adapter;

import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.web.server.ResponseStatusException;
import vn.thelooks.voting.application.port.out.PollReportRepositoryPort;
import vn.thelooks.voting.application.port.out.VoterKeyGenerator;
import vn.thelooks.voting.domain.model.AdminPollSummary;
import vn.thelooks.voting.domain.model.PollModerationAudit;
import vn.thelooks.voting.domain.model.PollReport;

@Repository
class PollReportRepositoryAdapter implements PollReportRepositoryPort {
    private final JdbcTemplate jdbc;
    private final VoterKeyGenerator keys;
    PollReportRepositoryAdapter(JdbcTemplate jdbc, VoterKeyGenerator keys) { this.jdbc=jdbc; this.keys=keys; }

    public void report(String code, String inputReason, String voterId, String ip) {
        String reason = inputReason == null ? "" : inputReason.trim();
        if (reason.length() < 5 || reason.length() > 300)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lý do phải dài 5–300 ký tự");
        var ids = jdbc.query("SELECT id FROM polls WHERE code=? AND hidden=FALSE", (rs,row)->rs.getObject(1,UUID.class),code);
        if (ids.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bình chọn");
        UUID pollId = ids.getFirst();
        String ipKey = keys.forIp(code, ip);
        Long count = jdbc.queryForObject("SELECT count(*) FROM poll_reports WHERE poll_id=? AND ip_key=? AND created_at>now()-interval '1 day'",
                Long.class,pollId,ipKey);
        if (count != null && count >= 3) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Bạn đã gửi quá nhiều báo cáo");
        String reporter = voterId != null && voterId.matches("[A-Za-z0-9_-]{43}") ? voterId : ip;
        int inserted = jdbc.update("""
                INSERT INTO poll_reports(id,poll_id,reporter_key,ip_key,reason) VALUES (?,?,?,?,?)
                ON CONFLICT (poll_id,reporter_key) DO NOTHING
                """,UUID.randomUUID(),pollId,keys.forPoll(code,reporter),ipKey,reason);
        if (inserted == 0) throw new ResponseStatusException(HttpStatus.CONFLICT,"Bạn đã báo cáo bình chọn này");
    }

    public List<PollReport> reports(String status) {
        if (!List.of("OPEN","IGNORED","HIDDEN","ALL").contains(status))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Trạng thái không hợp lệ");
        return jdbc.query("""
                SELECT r.id,p.code,p.question,r.reason,r.status,r.created_at FROM poll_reports r
                JOIN polls p ON p.id=r.poll_id WHERE ?='ALL' OR r.status=? ORDER BY r.created_at DESC LIMIT 100
                """,(rs,row)->new PollReport(rs.getObject(1,UUID.class),rs.getString(2),rs.getString(3),
                rs.getString(4),rs.getString(5),rs.getTimestamp(6).toInstant()),status,status);
    }

    @Transactional
    public PollReport decide(UUID actorId, UUID id, String status) {
        if (!List.of("IGNORED","HIDDEN").contains(status))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Quyết định không hợp lệ");
        var rows = jdbc.query("""
                SELECT r.id,p.id AS poll_id,p.code,p.question,r.reason,r.status,r.created_at
                FROM poll_reports r JOIN polls p ON p.id=r.poll_id WHERE r.id=? FOR UPDATE OF r
                """,(rs,row)->new Object[]{rs.getObject("poll_id",UUID.class),rs.getString("code"),
                new PollReport(rs.getObject("id",UUID.class),rs.getString("code"),rs.getString("question"),
                rs.getString("reason"),rs.getString("status"),rs.getTimestamp("created_at").toInstant())},id);
        if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Không tìm thấy báo cáo");
        UUID pollId=(UUID)rows.getFirst()[0];
        String code=(String)rows.getFirst()[1];
        PollReport old=(PollReport)rows.getFirst()[2];
        if (!old.status().equals("OPEN")) throw new ResponseStatusException(HttpStatus.CONFLICT,"Báo cáo đã được xử lý");
        if (status.equals("HIDDEN")) {
            jdbc.update("UPDATE polls SET hidden=TRUE,updated_at=now() WHERE id=?",pollId);
            jdbc.update("UPDATE poll_reports SET status='HIDDEN',reviewed_at=now(),reviewed_by=? WHERE poll_id=? AND status='OPEN'",
                    actorId,pollId);
        } else jdbc.update("UPDATE poll_reports SET status='IGNORED',reviewed_at=now(),reviewed_by=? WHERE id=?",
                actorId,id);
        jdbc.update("INSERT INTO poll_moderation_audit(id,actor_id,poll_code,action) VALUES (?,?,?,?)",
                UUID.randomUUID(),actorId,code,status);
        return new PollReport(old.id(),code,old.question(),old.reason(),status,old.createdAt());
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordDecisionFailure(UUID actorId, UUID reportId, String action) {
        String pollCode = jdbc.query("SELECT p.code FROM poll_reports r JOIN polls p ON p.id=r.poll_id WHERE r.id=?",
                (rs, row) -> rs.getString(1), reportId).stream().findFirst()
                .orElse("REPORT_" + reportId.toString().substring(0, 24));
        String safeAction = action == null || action.length() > 20 ? "DECIDE" : action;
        jdbc.update("INSERT INTO poll_moderation_audit(id,actor_id,poll_code,action,outcome) VALUES (?,?,?,?,'FAILED')",
                UUID.randomUUID(), actorId, pollCode, safeAction);
    }

    public List<PollModerationAudit> audit() {
        return jdbc.query("SELECT id,actor_id,poll_code,action,outcome,created_at FROM poll_moderation_audit ORDER BY created_at DESC LIMIT 100",
                (rs,row)->new PollModerationAudit(rs.getObject(1,UUID.class),rs.getObject(2,UUID.class),
                rs.getString(3),rs.getString(4),rs.getString(5),rs.getTimestamp(6).toInstant()));
    }

    public AdminPollSummary summary(UUID id) {
        Long count=jdbc.queryForObject("SELECT count(*) FROM polls WHERE owner_id=?",Long.class,id);
        return new AdminPollSummary(count==null?0:count);
    }

    @Transactional
    public void delete(UUID id) {
        jdbc.queryForObject("SELECT count(*) FROM (SELECT pg_advisory_xact_lock(hashtextextended(?,0))) l",Long.class,id.toString());
        jdbc.update("INSERT INTO voting_deleted_owner(owner_id) VALUES (?) ON CONFLICT DO NOTHING",id);
        jdbc.update("DELETE FROM polls WHERE owner_id=?",id);
    }
}
