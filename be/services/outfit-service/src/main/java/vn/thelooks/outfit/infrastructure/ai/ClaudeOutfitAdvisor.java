package vn.thelooks.outfit.infrastructure.ai;

import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.errors.AnthropicException;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.StructuredMessage;
import com.anthropic.models.messages.StructuredMessageCreateParams;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import vn.thelooks.outfit.application.port.out.OutfitAiAdvisor;
import vn.thelooks.outfit.domain.model.AiUsage;
import vn.thelooks.outfit.domain.model.ClosetItem;
import vn.thelooks.outfit.domain.model.Occasion;
import vn.thelooks.outfit.domain.model.OutfitSuggestion;

/**
 * Claude chọn và xếp hạng trong các ứng viên đã lọc, viết lý do ngắn bằng tiếng Việt.
 * Bật bằng thelooks.ai.provider=claude + ANTHROPIC_API_KEY. Lỗi API → quay về thứ tự điểm, không làm hỏng gợi ý.
 */
@Component
@ConditionalOnProperty(name = "thelooks.ai.provider", havingValue = "claude")
class ClaudeOutfitAdvisor implements OutfitAiAdvisor {

    private static final Logger log = LoggerFactory.getLogger(ClaudeOutfitAdvisor.class);

    /** USD cho 1 triệu token (input, output). Model không có trong bảng thì tính theo giá Opus để không báo thiếu. */
    static final Map<String, double[]> PRICES = Map.of(
            "claude-opus-5-5", new double[] {4.00, 20.00},
            "claude-sonnet-5-5", new double[] {2.00, 10.00},
            "claude-haiku-5-5", new double[] {0.10, 0.50});

    static final String SYSTEM = """
            Bạn là stylist của ứng dụng The Looks (khẩu hiệu: Wear More. Buy Smarter.), người dùng là sinh viên/người trẻ Việt Nam.
            Bạn nhận danh sách outfit ứng viên, đều ghép từ quần áo người dùng đang có. Mỗi ứng viên có số thứ tự, các món \
            (loại, màu, phong cách), điểm hệ thống và ghi chú (hợp dịp, món lâu chưa mặc, thời tiết).
            Hãy chọn tối đa số lượng được yêu cầu, xếp tốt nhất trước. Ưu tiên: hợp dịp, phối màu đẹp, hợp thời tiết, \
            và dùng lại những món lâu chưa mặc. Chỉ dùng số thứ tự có trong danh sách.
            Với mỗi lựa chọn, viết lý do bằng tiếng Việt, tự nhiên, tối đa 20 từ, nói với người dùng ("bạn").
            """;

    private final AnthropicClient client;
    private final String model;

    ClaudeOutfitAdvisor(@Value("${thelooks.ai.model}") String model) {
        this.model = model;
        this.client = AnthropicOkHttpClient.builder()
                .fromEnv() // đọc ANTHROPIC_API_KEY
                .timeout(Duration.ofSeconds(20))
                .maxRetries(1)
                .build();
    }

    record Pick(
            @JsonPropertyDescription("Số thứ tự ứng viên trong danh sách") int index,
            @JsonPropertyDescription("Lý do ngắn bằng tiếng Việt, tối đa 20 từ") String reason) {
    }

    record Picks(List<Pick> picks) {
    }

    @Override
    public Advice choose(Occasion occasion, List<OutfitSuggestion> candidates, int limit) {
        if (candidates.isEmpty() || limit <= 0) {
            return Advice.withoutAi(candidates, limit);
        }
        StructuredMessageCreateParams<Picks> params = MessageCreateParams.builder()
                .model(model)
                .maxTokens(4000L)
                .system(SYSTEM)
                .outputConfig(Picks.class)
                .addUserMessage(prompt(occasion, candidates, limit))
                .build();
        try {
            StructuredMessage<Picks> response = client.messages().create(params);
            AiUsage usage = usage(response.usage().inputTokens(), response.usage().outputTokens());
            Picks picks = response.content().stream()
                    .flatMap(block -> block.text().stream())
                    .map(text -> text.text())
                    .findFirst()
                    .orElse(new Picks(List.of()));
            return new Advice(apply(picks, candidates, limit), usage);
        } catch (AnthropicException e) {
            log.warn("Gọi Claude thất bại, dùng thứ tự điểm: {}", e.getMessage());
            return Advice.withoutAi(candidates, limit);
        }
    }

    static String prompt(Occasion occasion, List<OutfitSuggestion> candidates, int limit) {
        String header = (occasion == null ? "Quick Pick: chọn bộ hợp để mặc hôm nay." : "Dịp: " + occasion.label() + ".")
                + " Chọn tối đa " + limit + " outfit.\n\nỨng viên:\n";
        return header + IntStream.range(0, candidates.size())
                .mapToObj(i -> "#" + i + ": " + describe(candidates.get(i)))
                .collect(Collectors.joining("\n"));
    }

    private static String describe(OutfitSuggestion s) {
        String items = s.items().stream().map(ClosetItem::describe).collect(Collectors.joining(" + "));
        return items + " | điểm " + Math.round(s.score() * 100) + "/100 | " + s.reason();
    }

    /** Giữ lựa chọn hợp lệ (đúng chỉ số, không trùng); thiếu thì lấp bằng ứng viên điểm cao còn lại. */
    static List<OutfitSuggestion> apply(Picks picks, List<OutfitSuggestion> candidates, int limit) {
        List<OutfitSuggestion> result = new ArrayList<>();
        Set<Integer> used = new LinkedHashSet<>();
        for (Pick p : picks.picks() == null ? List.<Pick>of() : picks.picks()) {
            if (result.size() == limit) {
                break;
            }
            if (p.index() >= 0 && p.index() < candidates.size() && used.add(p.index())) {
                OutfitSuggestion c = candidates.get(p.index());
                String reason = p.reason() == null || p.reason().isBlank() ? c.reason() : p.reason().strip();
                result.add(new OutfitSuggestion(c.items(), c.occasion(), c.score(), reason));
            }
        }
        for (int i = 0; i < candidates.size() && result.size() < limit; i++) {
            if (used.add(i)) {
                result.add(candidates.get(i));
            }
        }
        return result;
    }

    AiUsage usage(long inputTokens, long outputTokens) {
        double[] price = PRICES.getOrDefault(model, PRICES.get("claude-opus-5-5"));
        double cost = inputTokens / 1_000_000.0 * price[0] + outputTokens / 1_000_000.0 * price[1];
        return new AiUsage(model, inputTokens, outputTokens, cost);
    }
}
