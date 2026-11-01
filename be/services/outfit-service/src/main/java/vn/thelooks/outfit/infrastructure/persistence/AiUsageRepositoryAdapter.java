package vn.thelooks.outfit.infrastructure.persistence;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
import vn.thelooks.outfit.application.port.out.AiUsageRepository;
import vn.thelooks.outfit.domain.model.AiUsage;

@Component
class AiUsageRepositoryAdapter implements AiUsageRepository {

    private final JdbcClient jdbc;

    AiUsageRepositoryAdapter(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void record(UUID ownerId, AiUsage usage, Instant at) {
        jdbc.sql("""
                insert into outfit_ai_usage (owner_id, model, input_tokens, output_tokens, cost_usd, created_at)
                values (:owner, :model, :in, :out, :cost, :at)
                """)
                .param("owner", ownerId)
                .param("model", usage.model())
                .param("in", usage.inputTokens())
                .param("out", usage.outputTokens())
                .param("cost", usage.costUsd())
                .param("at", Timestamp.from(at))
                .update();
    }

    @Override
    public long callsSince(UUID ownerId, Instant since) {
        return jdbc.sql("select count(*) from outfit_ai_usage where owner_id = :owner and created_at >= :since")
                .param("owner", ownerId)
                .param("since", Timestamp.from(since))
                .query(Long.class)
                .single();
    }

    @Override
    public double costSince(Instant since) {
        return jdbc.sql("select coalesce(sum(cost_usd), 0) from outfit_ai_usage where created_at >= :since")
                .param("since", Timestamp.from(since))
                .query(Double.class)
                .single();
    }

    @Override
    public List<UserCost> topUsersSince(Instant since, int limit) {
        return jdbc.sql("""
                select owner_id, count(*) as calls, sum(cost_usd) as cost
                from outfit_ai_usage where created_at >= :since
                group by owner_id order by cost desc limit :limit
                """)
                .param("since", Timestamp.from(since))
                .param("limit", limit)
                .query((rs, n) -> new UserCost(rs.getObject("owner_id", UUID.class), rs.getLong("calls"), rs.getDouble("cost")))
                .list();
    }
}
