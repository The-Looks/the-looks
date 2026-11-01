package vn.thelooks.outfit.domain.model;

/** Một lần gọi AI: số token và chi phí (USD) để theo dõi ngân sách. */
public record AiUsage(String model, long inputTokens, long outputTokens, double costUsd) {
}
