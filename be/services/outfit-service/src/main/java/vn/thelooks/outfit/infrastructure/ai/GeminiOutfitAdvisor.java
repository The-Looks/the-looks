package vn.thelooks.outfit.infrastructure.ai;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import vn.thelooks.outfit.application.port.out.OutfitAiAdvisor;
import vn.thelooks.outfit.domain.model.AiUsage;
import vn.thelooks.outfit.domain.model.Occasion;
import vn.thelooks.outfit.domain.model.OutfitSuggestion;
import vn.thelooks.outfit.domain.model.StyleProfile;

/**
 * Chế độ auto: Claude chọn outfit trước (nhanh); Claude lỗi (hết credit, quá giới hạn, mất kết nối) thì Gemini,
 * rồi Gemini dự phòng; tất cả lỗi thì vẫn trả gợi ý xếp theo điểm.
 */
@Component
@ConditionalOnProperty(name = "thelooks.ai.provider", havingValue = "auto", matchIfMissing = true)
class GeminiOutfitAdvisor implements OutfitAiAdvisor {
    private static final Logger log = LoggerFactory.getLogger(GeminiOutfitAdvisor.class);
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(4)).build();
    private final ObjectMapper mapper;
    private final String key;
    private final String primary;
    private final String backup;
    private final OutfitAiAdvisor claude;

    @org.springframework.beans.factory.annotation.Autowired
    GeminiOutfitAdvisor(ObjectMapper mapper, @Value("${GEMINI_API_KEY:}") String key,
            @Value("${thelooks.ai.gemini-model:gemini-3.5-flash-lite}") String primary,
            @Value("${thelooks.ai.gemini-backup-model:gemini-3.1-flash-lite}") String backup,
            @Value("${ANTHROPIC_API_KEY:}") String claudeKey,
            @Value("${thelooks.ai.model}") String claudeModel) {
        this.mapper = mapper;
        this.key = key;
        this.primary = primary;
        this.backup = backup;
        this.claude = claudeKey.isBlank() ? null : new ClaudeOutfitAdvisor(claudeModel);
    }

    /** Cho test: thay Claude bằng bản giả. */
    GeminiOutfitAdvisor(ObjectMapper mapper, String key, String primary, String backup, OutfitAiAdvisor claude) {
        this.mapper = mapper;
        this.key = key;
        this.primary = primary;
        this.backup = backup;
        this.claude = claude;
    }

    @Override
    public Advice choose(Occasion occasion, List<OutfitSuggestion> candidates, StyleProfile taste, int limit) {
        if (candidates.isEmpty() || limit <= 0) return Advice.withoutAi(candidates, limit);
        if (claude != null) {
            Advice advice = claude.choose(occasion, candidates, taste, limit);
            if (advice.usage() != null) return advice; // usage null = Claude lỗi, đã tự xếp theo điểm
        }
        if (!key.isBlank()) for (String model : List.of(primary, backup)) {
            try { return call(model, occasion, candidates, taste, limit); }
            catch (Exception ex) { log.warn("Gemini outfit advice failed with {}: {}", model, ex.getMessage()); }
        }
        // The recommender already scored real wardrobe combinations; keep them available when AI is down.
        return Advice.withoutAi(candidates, limit);
    }

    private Advice call(String model, Occasion occasion, List<OutfitSuggestion> candidates, StyleProfile taste, int limit) throws Exception {
        Map<String, Object> payload = Map.of(
                "contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text",
                        ClaudeOutfitAdvisor.SYSTEM + "\nReturn JSON {\"picks\":[{\"index\":0,\"reason\":\"...\"}]} only.\n"
                                + ClaudeOutfitAdvisor.prompt(occasion, candidates.stream().limit(12).toList(), taste, limit))))),
                "generationConfig", Map.of("responseMimeType", "application/json", "maxOutputTokens", 700,
                        "thinkingConfig", Map.of("thinkingLevel", "low")));
        HttpRequest request = HttpRequest.newBuilder(URI.create("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent"))
                .timeout(Duration.ofSeconds(model.equals(primary) ? 8 : 6)).header("x-goog-api-key", key).header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(payload))).build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() / 100 != 2) throw new IllegalStateException("Gemini HTTP " + response.statusCode());
        JsonNode root = mapper.readTree(response.body());
        JsonNode parts = root.path("candidates").path(0).path("content").path("parts");
        if (!parts.isArray()) throw new IllegalStateException("Gemini returned no candidates");
        for (JsonNode part : parts) if (part.hasNonNull("text")) {
            ClaudeOutfitAdvisor.Picks picks = parse(mapper, part.path("text").asString());
            JsonNode usage = root.path("usageMetadata");
            long inputTokens = usage.path("promptTokenCount").asLong();
            long outputTokens = Math.max(usage.path("candidatesTokenCount").asLong(),
                    usage.path("totalTokenCount").asLong() - inputTokens);
            double[] rate = pricePerMillion(model);
            double costUsd = (inputTokens * rate[0] + outputTokens * rate[1]) / 1_000_000.0;
            return new Advice(ClaudeOutfitAdvisor.apply(picks, candidates.stream().limit(12).toList(), limit),
                    new AiUsage(model, inputTokens, outputTokens, costUsd));
        }
        throw new IllegalStateException("Gemini returned no JSON text");
    }

    /**
     * USD / 1 triệu token [input, output], giá Standard trả phí (aistudio.google.com/docs/pricing, 11/2026), gồm cả token suy nghĩ.
     * Model lạ tính theo giá Flash (cao hơn) để ngân sách AI không bị đếm thiếu.
     */
    static double[] pricePerMillion(String model) {
        if (model.contains("3.1-flash-lite")) return new double[] {0.25, 1.50};
        if (model.contains("flash-lite")) return new double[] {0.30, 2.50};
        return new double[] {0.75, 3.75};
    }

    /** Gemini có lúc trả thẳng danh sách [...] thay vì {"picks": [...]}: nhận cả hai. */
    static ClaudeOutfitAdvisor.Picks parse(ObjectMapper mapper, String json) {
        JsonNode node = mapper.readTree(json);
        if (node.isArray()) {
            node = mapper.createObjectNode().set("picks", node);
        }
        return mapper.treeToValue(node, ClaudeOutfitAdvisor.Picks.class);
    }
}
