package vn.thelooks.auth.infrastructure.persistence.adapter;

import java.util.UUID;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import vn.thelooks.auth.application.port.out.AccountDeletionCoordinatorPort;
import vn.thelooks.auth.application.port.out.AccountDeletionTokenPort;
import vn.thelooks.auth.domain.model.AccountDeletionJob;
import vn.thelooks.auth.domain.model.AccountDeletionWorkflow;

@Component
class AccountDeletionCoordinatorAdapter implements AccountDeletionCoordinatorPort {
    private final JdbcTemplate jdbc;
    private final TransactionTemplate tx;
    private final RestClient http;
    private final AccountDeletionTokenPort tokens;
    private final int retryAfterSeconds;
    private final String voting, wardrobe, outfit, billing;

    AccountDeletionCoordinatorAdapter(JdbcTemplate jdbc, PlatformTransactionManager transactions,
            AccountDeletionTokenPort tokens,
            @Value("${ACCOUNT_DELETION_RETRY_AFTER_SECONDS:300}") int retryAfterSeconds,
            @Value("${thelooks.services.voting:http://localhost:8084}") String voting,
            @Value("${thelooks.services.wardrobe:http://localhost:8082}") String wardrobe,
            @Value("${thelooks.services.outfit:http://localhost:8083}") String outfit,
            @Value("${thelooks.services.billing:http://localhost:8085}") String billing) {
        this.jdbc=jdbc; this.tx=new TransactionTemplate(transactions); this.tokens=tokens;
        this.retryAfterSeconds=Math.max(1,retryAfterSeconds);
        var requests=new SimpleClientHttpRequestFactory();
        requests.setConnectTimeout(Duration.ofSeconds(5));
        requests.setReadTimeout(Duration.ofSeconds(30));
        this.http=RestClient.builder().requestFactory(requests).build();
        this.voting=voting; this.wardrobe=wardrobe; this.outfit=outfit; this.billing=billing;
    }

    @Override
    public AccountDeletionJob get(UUID targetId) {
        return jdbc.query("SELECT * FROM account_deletions WHERE target_id=?",(rs,row)->new AccountDeletionJob(
                rs.getObject("target_id",UUID.class),rs.getObject("actor_id",UUID.class),
                rs.getString("step"),rs.getString("status"),rs.getString("last_error"),
                rs.getTimestamp("created_at").toInstant(),rs.getTimestamp("updated_at").toInstant()),targetId)
                .stream().findFirst().orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Không tìm thấy yêu cầu xóa"));
    }

    @Override
    public synchronized AccountDeletionJob startOrRetry(UUID actorId, UUID targetId) {
        AccountDeletionJob job=tx.execute(status -> {
            jdbc.execute("SELECT pg_advisory_xact_lock(83104212)");
            var exists = jdbc.query("SELECT id FROM users WHERE id=?",(rs,row)->rs.getObject(1,UUID.class),targetId);
            if (exists.isEmpty()) {
                AccountDeletionJob prior=get(targetId);
                if (prior.status().equals("DONE")) return prior;
                throw new ResponseStatusException(HttpStatus.CONFLICT,"Tài khoản đã mất trước khi xóa xong");
            }
            Long adminCount = jdbc.queryForObject("""
                    SELECT count(*) FROM users u JOIN user_roles ur ON ur.user_id=u.id
                    JOIN roles r ON r.id=ur.role_id WHERE r.code='ADMIN' AND u.status='ACTIVE'
                    """,Long.class);
            Boolean targetAdmin = jdbc.queryForObject("""
                    SELECT EXISTS(SELECT 1 FROM user_roles ur JOIN roles r ON r.id=ur.role_id
                    WHERE ur.user_id=? AND r.code='ADMIN')
                    """,Boolean.class,targetId);
            String targetStatus = jdbc.queryForObject("SELECT status FROM users WHERE id=?",String.class,targetId);
            if (Boolean.TRUE.equals(targetAdmin) && "ACTIVE".equals(targetStatus) && (adminCount==null || adminCount<=1))
                throw new ResponseStatusException(HttpStatus.CONFLICT,"Không thể xóa quản trị viên cuối cùng");
            jdbc.update("UPDATE users SET status='LOCKED',updated_at=now() WHERE id=?",targetId);
            jdbc.update("UPDATE refresh_sessions SET revoked_at=COALESCE(revoked_at,now()),updated_at=now() WHERE user_id=?",targetId);
            int created=jdbc.update("""
                    INSERT INTO account_deletions(target_id,actor_id) VALUES (?,?) ON CONFLICT DO NOTHING
                    """,targetId,actorId);
            if (created==1) audit(actorId,targetId,"USER_DELETE_REQUESTED","VOTING");
            return get(targetId);
        });
        if (job.status().equals("DONE")) return job;
        int acquired = jdbc.update("""
                UPDATE account_deletions SET status='RUNNING',last_error=NULL,updated_at=now()
                WHERE target_id=? AND (status IN ('PENDING','FAILED')
                    OR (status='RUNNING' AND updated_at < now() - interval '5 minutes'))
                """, targetId);
        if (acquired == 0) return get(targetId);
        AccountDeletionWorkflow.Result result;
        try {
            result = AccountDeletionWorkflow.run(job.step(), (step, nextStep) -> {
                if (step.equals("AUTH")) {
                    tx.executeWithoutResult(status -> {
                        jdbc.update("DELETE FROM users WHERE id=?",targetId);
                        jdbc.update("UPDATE account_deletions SET step='DONE',status='DONE',updated_at=now() WHERE target_id=?",targetId);
                        audit(actorId,targetId,"USER_DELETE_COMPLETED",null);
                    });
                    return;
                }
                String base=switch(step) {
                    case "VOTING" -> voting;
                    case "WARDROBE" -> wardrobe;
                    case "OUTFIT" -> outfit;
                    default -> billing;
                };
                String path=switch(step) {
                    case "VOTING" -> "/api/admin/polls/users/"+targetId+"/data";
                    case "WARDROBE" -> "/api/admin/wardrobe/users/"+targetId+"/data";
                    case "OUTFIT" -> "/api/admin/outfits/users/"+targetId+"/data";
                    default -> "/api/admin/billing/users/"+targetId+"/data";
                };
                http.delete().uri(base+path).header("Authorization","Bearer "+tokens.issue(targetId)).retrieve().toBodilessEntity();
                jdbc.update("UPDATE account_deletions SET step=?,updated_at=now() WHERE target_id=?",nextStep,targetId);
            });
        } catch (IllegalArgumentException invalidStep) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"Bước xóa không hợp lệ", invalidStep);
        }
        if (!result.completed()) {
            String error=result.step()+": "+result.failure().getMessage();
            jdbc.update("UPDATE account_deletions SET status='FAILED',last_error=?,updated_at=now() WHERE target_id=?",
                    error.substring(0,Math.min(500,error.length())),targetId);
            audit(actorId,targetId,"USER_DELETE_FAILED",result.step(),"FAILED");
        }
        return get(targetId);
    }

    public void retryOutstanding() {
        var jobs = jdbc.query("""
                SELECT actor_id,target_id FROM account_deletions
                WHERE status IN ('PENDING','FAILED','RUNNING') AND updated_at < now() - (? * interval '1 second')
                ORDER BY updated_at LIMIT 20
                """, (rs, row) -> new UUID[] { rs.getObject(1, UUID.class), rs.getObject(2, UUID.class) }, retryAfterSeconds);
        for (var job : jobs) {
            try { startOrRetry(job[0], job[1]); }
            catch (RuntimeException ignored) { /* The job stays visible as FAILED for the next retry. */ }
        }
    }

    private void audit(UUID actor,UUID target,String action,String detail) {
        audit(actor,target,action,detail,"SUCCESS");
    }

    private void audit(UUID actor,UUID target,String action,String detail,String outcome) {
        jdbc.update("INSERT INTO admin_audit(id,actor_id,target_id,action,detail,outcome) VALUES (?,?,?,?,?,?)",
                UUID.randomUUID(),actor,target.toString(),action,detail,outcome);
    }
}
