package vn.thelooks.outfit.application.port.out;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import vn.thelooks.outfit.domain.model.AiUsage;

public interface AiUsageRepository {

    void record(UUID ownerId, AiUsage usage, Instant at);

    long callsSince(UUID ownerId, Instant since);

    double costSince(Instant since);

    /** Tổng chi phí theo người dùng từ mốc thời gian, nhiều nhất trước. */
    List<UserCost> topUsersSince(Instant since, int limit);

    record UserCost(UUID ownerId, long calls, double costUsd) {
    }
}
