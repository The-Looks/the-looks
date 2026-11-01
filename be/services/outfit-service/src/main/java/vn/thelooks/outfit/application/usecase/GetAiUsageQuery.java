package vn.thelooks.outfit.application.usecase;

import java.util.List;
import vn.thelooks.outfit.application.port.out.AiUsageRepository.UserCost;

/** Cho admin: chi phí AI tháng này so với ngân sách. */
public interface GetAiUsageQuery {

    Report thisMonth();

    record Report(String month, double costUsd, double budgetUsd, List<UserCost> topUsers) {
    }
}
