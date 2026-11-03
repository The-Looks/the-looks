package vn.thelooks.wardrobe.infrastructure.ai;

import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.models.messages.Base64ImageSource;
import com.anthropic.models.messages.ContentBlockParam;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.StructuredMessage;
import com.anthropic.models.messages.StructuredMessageCreateParams;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Base64;
import java.util.EnumSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import vn.thelooks.wardrobe.application.port.out.GarmentDetector;
import vn.thelooks.wardrobe.domain.model.BoundingBox;
import vn.thelooks.wardrobe.domain.model.Category;
import vn.thelooks.wardrobe.domain.model.ClothingAttributes;
import vn.thelooks.wardrobe.domain.model.DetectedGarment;
import vn.thelooks.wardrobe.domain.model.Season;

/**
 * Claude vision tìm mọi món đồ trong ảnh (structured output). Bật bằng thelooks.ai.provider=claude + ANTHROPIC_API_KEY.
 * Nhãn màu và phong cách dùng đúng bộ từ mà outfit-service chấm điểm (OutfitRecommender).
 */
@Component
@ConditionalOnProperty(name = "thelooks.ai.provider", havingValue = "claude")
class ClaudeGarmentDetector implements GarmentDetector {

    static final Set<String> STYLE_TAGS = Set.of("casual", "basic", "sporty", "streetwear", "preppy", "formal", "office",
            "smart-casual", "minimal", "elegant", "romantic", "trendy", "feminine");

    static final String SYSTEM = """
            You catalogue clothes for a wardrobe app (users are young Vietnamese students and office workers).
            Find every separate garment, pair of shoes, bag or accessory that is clearly visible in the photo:
            a person wearing an outfit, or several items laid out. Ignore people's faces and body, furniture, and items
            mostly hidden or cut off. Report each physical item once (a pair of shoes is one item).
            For each item give a tight bounding box as fractions of the image width and height (0..1, origin top-left),
            category, 1-3 basic colour names in lowercase English (white, black, gray, beige, cream, brown, navy, blue,
            denim, green, red, pink, purple, yellow, orange), material if obvious, suitable seasons, style tags chosen only
            from the allowed list, and your confidence 0..1.
            """;

    record Box(
            @JsonPropertyDescription("Left edge, fraction of image width 0..1") double x,
            @JsonPropertyDescription("Top edge, fraction of image height 0..1") double y,
            @JsonPropertyDescription("Width, fraction of image width") double width,
            @JsonPropertyDescription("Height, fraction of image height") double height) {
    }

    record Garment(
            @JsonPropertyDescription("One of TOP, BOTTOM, DRESS, OUTERWEAR, SHOES, BAG, ACCESSORY") String category,
            @JsonPropertyDescription("1-3 basic colour names in lowercase English") List<String> colors,
            @JsonPropertyDescription("Material such as cotton, denim, linen, leather; empty if unsure") String material,
            @JsonPropertyDescription("Any of SPRING, SUMMER, AUTUMN, WINTER; empty list if wearable all year") List<String> seasons,
            @JsonPropertyDescription("Only from: casual, basic, sporty, streetwear, preppy, formal, office, smart-casual, minimal, elegant, romantic, trendy, feminine") List<String> styleTags,
            Box box,
            @JsonPropertyDescription("Confidence 0..1 that this is a real, separate item") double confidence) {
    }

    record Detections(List<Garment> garments) {
    }

    private final AnthropicClient client;
    private final String model;

    ClaudeGarmentDetector(@Value("${thelooks.ai.model}") String model) {
        this.model = model;
        this.client = AnthropicOkHttpClient.builder().fromEnv().timeout(Duration.ofSeconds(18)).maxRetries(0).build();
    }

    @Override
    public List<DetectedGarment> detect(byte[] image, String contentType) {
        StructuredMessageCreateParams<Detections> params = MessageCreateParams.builder()
                .model(model)
                .maxTokens(2500L)
                .system(SYSTEM)
                .outputConfig(Detections.class)
                .addUserMessageOfContentBlockParams(List.of(
                        ContentBlockParam.ofImage(Base64ImageSource.builder()
                                .mediaType(Base64ImageSource.MediaType.IMAGE_JPEG)
                                .data(Base64.getEncoder().encodeToString(image))
                                .build()),
                        ContentBlockParam.ofText("List every clothing item in this photo.")))
                .build();
        StructuredMessage<Detections> response = client.messages().create(params);
        return response.content().stream()
                .flatMap(block -> block.text().stream())
                .map(text -> toDomain(text.text()))
                .findFirst()
                .orElse(List.of());
    }

    /** Bỏ món có loại lạ; nhãn mùa / phong cách ngoài danh sách bị lọc bỏ. */
    static List<DetectedGarment> toDomain(Detections detections) {
        List<DetectedGarment> result = new ArrayList<>();
        if (detections == null || detections.garments() == null) {
            return result;
        }
        for (Garment g : detections.garments()) {
            Category category;
            try {
                category = Category.valueOf(String.valueOf(g.category()).trim().toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException e) {
                continue;
            }
            if (g.box() == null) {
                continue;
            }
            Set<Season> seasons = EnumSet.noneOf(Season.class);
            for (String s : g.seasons() == null ? List.<String>of() : g.seasons()) {
                try {
                    seasons.add(Season.valueOf(s.trim().toUpperCase(Locale.ROOT)));
                } catch (IllegalArgumentException ignored) {
                    // mùa lạ: bỏ qua
                }
            }
            Set<String> tags = new LinkedHashSet<>();
            for (String t : g.styleTags() == null ? List.<String>of() : g.styleTags()) {
                String tag = t.trim().toLowerCase(Locale.ROOT);
                if (STYLE_TAGS.contains(tag)) {
                    tags.add(tag);
                }
            }
            List<String> colors = g.colors() == null ? List.of()
                    : g.colors().stream().map(c -> c.trim().toLowerCase(Locale.ROOT).replace(",", "")).filter(c -> !c.isEmpty()).limit(3).toList();
            String material = g.material() == null || g.material().isBlank() ? null : g.material().trim();
            result.add(new DetectedGarment(new ClothingAttributes(category, colors, material, seasons, tags),
                    new BoundingBox(g.box().x(), g.box().y(), g.box().width(), g.box().height()),
                    Math.max(0, Math.min(1, g.confidence()))));
        }
        return result;
    }
}
