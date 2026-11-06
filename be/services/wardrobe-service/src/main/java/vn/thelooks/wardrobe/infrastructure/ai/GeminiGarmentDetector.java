package vn.thelooks.wardrobe.infrastructure.ai;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import vn.thelooks.wardrobe.application.port.out.GarmentDetector;
import vn.thelooks.wardrobe.domain.model.DetectedGarment;

/** Gemini vision is primary. An alternate Gemini model and Claude are tried on provider failure. */
@Component
@ConditionalOnProperty(name = "thelooks.ai.provider", havingValue = "auto", matchIfMissing = true)
class GeminiGarmentDetector implements GarmentDetector {
    private static final Logger log = LoggerFactory.getLogger(GeminiGarmentDetector.class);
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(4)).build();
    private final ObjectMapper mapper;
    private final String key;
    private final String primary;
    private final String backup;
    private final GarmentDetector claude;

    GeminiGarmentDetector(ObjectMapper mapper, @Value("${GEMINI_API_KEY:}") String key,
            @Value("${thelooks.ai.gemini-model:gemini-3.5-flash-lite}") String primary,
            @Value("${thelooks.ai.gemini-backup-model:gemini-3.1-flash-lite}") String backup,
            @Value("${ANTHROPIC_API_KEY:}") String claudeKey,
            @Value("${thelooks.ai.model}") String claudeModel) {
        this.mapper = mapper;
        this.key = key;
        this.primary = primary;
        this.backup = backup;
        this.claude = claudeKey.isBlank() ? null : new ClaudeGarmentDetector(claudeModel);
    }

    @Override
    public List<DetectedGarment> detect(byte[] image, String contentType) {
        RuntimeException last = new IllegalStateException("Cần GEMINI_API_KEY hoặc ANTHROPIC_API_KEY để nhận diện ảnh thật");
        if (!key.isBlank()) for (String model : List.of(primary, backup)) {
            try {
                List<DetectedGarment> result = call(model, image, contentType);
                if (!result.isEmpty()) return result;
                last = new IllegalStateException("AI không nhận diện được món đồ trong ảnh");
            } catch (Exception ex) {
                log.warn("Gemini garment detection failed with {}: {}", model, ex.getMessage());
                last = new IllegalStateException("Gemini nhận diện ảnh thất bại", ex);
            }
        }
        if (claude != null) try { return claude.detect(image, contentType); }
        catch (RuntimeException ex) { log.warn("Claude garment fallback failed: {}", ex.getMessage()); last = ex; }
        throw last;
    }

    private List<DetectedGarment> call(String model, byte[] image, String contentType) throws Exception {
        Map<String, Object> payload = Map.of(
                "contents", List.of(Map.of("role", "user", "parts", List.of(
                        Map.of("text", ClaudeGarmentDetector.SYSTEM + " Return JSON with a garments array. Each garment needs category, colors, material, seasons, styleTags, box{x,y,width,height}, confidence."),
                        Map.of("inline_data", Map.of("mime_type", contentType, "data", Base64.getEncoder().encodeToString(image)))))),
                "generationConfig", Map.of("responseMimeType", "application/json", "maxOutputTokens", 2500,
                        "thinkingConfig", Map.of("thinkingLevel", "low")));
        HttpRequest request = HttpRequest.newBuilder(URI.create("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent"))
                .timeout(Duration.ofSeconds(model.equals(primary) ? 12 : 8)).header("x-goog-api-key", key).header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(payload))).build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() / 100 != 2) throw new IllegalStateException("Gemini HTTP " + response.statusCode());
        JsonNode parts = mapper.readTree(response.body()).path("candidates").path(0).path("content").path("parts");
        if (!parts.isArray()) throw new IllegalStateException("Gemini returned no candidates");
        for (JsonNode part : parts) if (part.hasNonNull("text"))
            return ClaudeGarmentDetector.toDomain(mapper.readValue(part.path("text").asString(), ClaudeGarmentDetector.Detections.class));
        throw new IllegalStateException("Gemini returned no JSON text");
    }
}
