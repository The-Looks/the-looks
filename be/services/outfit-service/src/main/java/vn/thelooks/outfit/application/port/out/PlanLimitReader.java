package vn.thelooks.outfit.application.port.out;

/**
 * Số lượt AI gợi ý mỗi ngày theo gói của người dùng hiện tại (Free 3, Plus 20, Pro 100).
 * Cài đặt: client gọi billing-service GET /api/app/billing/me với JWT được chuyển tiếp.
 */
public interface PlanLimitReader {

    /** Giới hạn của gói Free, dùng khi không hỏi được billing-service. */
    int FREE_AI_PER_DAY = 3;

    int aiSuggestionsPerDay();
}
