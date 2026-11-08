package vn.thelooks.wardrobe.infrastructure.ai;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import tools.jackson.databind.ObjectMapper;
import vn.thelooks.wardrobe.application.port.out.GarmentDetector;
import vn.thelooks.wardrobe.domain.model.DetectedGarment;

/**
 * Việc 1.10: đo AI nhận diện loại đồ trên ảnh thật (docs/ai-eval/sample.csv, 250 ảnh từ clothing-dataset, CC0).
 * Không chạy trong CI; chạy tay theo hướng dẫn trong docs/ai-eval/README.md. Ghi kết quả ra docs/ai-nhan-dien.md.
 */
@EnabledIfEnvironmentVariable(named = "AI_EVAL_DIR", matches = ".+")
class GarmentDetectionEvalTest {

    static final String IMAGES = "https://raw.githubusercontent.com/alexeygrigorev/clothing-dataset/master/images/";

    record Row(String image, String label, String expected) {}

    record Result(Row row, List<DetectedGarment> found, String error, long millis) {
        /** Món tin cậy nhất là đúng loại. */
        boolean top() {
            return !found.isEmpty() && found.stream().max((a, b) -> Double.compare(a.confidence(), b.confidence()))
                    .orElseThrow().attributes().category().name().equals(row.expected());
        }

        /** Có ít nhất một món đúng loại trong các món tìm được. */
        boolean any() {
            return found.stream().anyMatch(g -> g.attributes().category().name().equals(row.expected()));
        }

        String predicted() {
            return error != null ? "LỖI" : found.isEmpty() ? "KHÔNG THẤY"
                    : found.stream().max((a, b) -> Double.compare(a.confidence(), b.confidence())).orElseThrow().attributes().category().name();
        }
    }

    @Test
    void measureDetectionAccuracy() throws Exception {
        Path dir = Path.of(System.getenv("AI_EVAL_DIR")).toAbsolutePath().normalize();
        Path images = Files.createDirectories(dir.resolve("images"));
        int limit = Integer.parseInt(System.getenv().getOrDefault("AI_EVAL_LIMIT", "250"));
        long delay = Long.parseLong(System.getenv().getOrDefault("AI_EVAL_DELAY_MS", "4000"));
        List<Row> rows = Files.readAllLines(dir.resolve("sample.csv")).stream().skip(1).filter(l -> !l.isBlank())
                .map(l -> l.split(",")).map(c -> new Row(c[0], c[1], c[2])).limit(limit).toList();

        String gemini = System.getenv().getOrDefault("GEMINI_API_KEY", "");
        String claudeModel = System.getenv().getOrDefault("AI_MODEL", "claude-haiku-5-5");
        GarmentDetector detector = gemini.isBlank()
                ? new ClaudeGarmentDetector(claudeModel)
                : new GeminiGarmentDetector(new ObjectMapper(), gemini, "gemini-3.5-flash-lite", "gemini-3.1-flash-lite",
                        System.getenv().getOrDefault("ANTHROPIC_API_KEY", ""), claudeModel);
        String provider = gemini.isBlank() ? "Claude (" + claudeModel + ")" : "Gemini 3.5 Flash-Lite (dự phòng 3.1 Flash-Lite, Claude)";

        HttpClient http = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NORMAL).connectTimeout(Duration.ofSeconds(10)).build();
        List<Result> results = new ArrayList<>();
        for (Row row : rows) {
            Path file = images.resolve(row.image() + ".jpg");
            if (Files.notExists(file)) {
                var response = http.send(HttpRequest.newBuilder(URI.create(IMAGES + row.image() + ".jpg")).build(),
                        HttpResponse.BodyHandlers.ofByteArray());
                if (response.statusCode() != 200) {
                    results.add(new Result(row, List.of(), "tải ảnh lỗi " + response.statusCode(), 0));
                    continue;
                }
                Files.write(file, response.body());
            }
            long start = System.nanoTime();
            try {
                results.add(new Result(row, detector.detect(Files.readAllBytes(file), "image/jpeg"), null,
                        (System.nanoTime() - start) / 1_000_000));
            } catch (RuntimeException e) {
                results.add(new Result(row, List.of(), e.toString(), (System.nanoTime() - start) / 1_000_000));
            }
            System.out.printf("%d/%d %s → %s%n", results.size(), rows.size(), row.expected(), results.getLast().predicted());
            Thread.sleep(delay);
        }
        Files.writeString(dir.resolveSibling("ai-nhan-dien.md"), report(results, provider), StandardCharsets.UTF_8);
    }

    static String report(List<Result> results, String provider) throws IOException {
        var answered = results.stream().filter(r -> r.error() == null).toList();
        long top = answered.stream().filter(Result::top).count();
        long any = answered.stream().filter(Result::any).count();
        long empty = answered.stream().filter(r -> r.found().isEmpty()).count();
        var times = answered.stream().mapToLong(Result::millis).sorted().toArray();
        StringBuilder md = new StringBuilder();
        md.append("# Kết quả thử AI nhận diện quần áo (việc 1.10)\n\n")
                .append("Ngày chạy: ").append(LocalDate.now()).append(" · AI: ").append(provider).append('\n')
                .append("Bộ ảnh: ").append(results.size()).append(" ảnh thật từ [clothing-dataset](https://github.com/alexeygrigorev/clothing-dataset) (CC0), ")
                .append("danh sách trong `docs/ai-eval/sample.csv`. Mỗi ảnh chụp một món, nhãn do người gán.\n\n")
                .append("## Tổng quan\n\n| Chỉ số | Kết quả |\n|---|---|\n")
                .append(row("Ảnh AI trả lời được", answered.size() + " / " + results.size()))
                .append(row("Đúng loại đồ (món tin cậy nhất)", pct(top, answered.size())))
                .append(row("Có món đúng loại trong các món tìm được", pct(any, answered.size())))
                .append(row("Không tìm thấy món nào", pct(empty, answered.size())))
                .append(row("Thời gian trả lời (trung vị / 90%)", times.length == 0 ? "—"
                        : times[times.length / 2] / 1000.0 + " s / " + times[(int) (times.length * 0.9)] / 1000.0 + " s"))
                .append("\n## Theo loại đồ\n\n| Loại | Số ảnh | Đúng loại | Hay bị nhầm thành |\n|---|---|---|---|\n");
        Map<String, List<Result>> byCategory = new TreeMap<>();
        answered.forEach(r -> byCategory.computeIfAbsent(r.row().expected(), k -> new ArrayList<>()).add(r));
        byCategory.forEach((category, list) -> {
            Map<String, Long> wrong = new TreeMap<>();
            list.stream().filter(r -> !r.top()).forEach(r -> wrong.merge(r.predicted(), 1L, Long::sum));
            String confused = wrong.entrySet().stream().sorted((a, b) -> Long.compare(b.getValue(), a.getValue())).limit(3)
                    .map(e -> e.getKey() + " (" + e.getValue() + ")").reduce((a, b) -> a + ", " + b).orElse("—");
            md.append("| ").append(category).append(" | ").append(list.size()).append(" | ")
                    .append(pct(list.stream().filter(Result::top).count(), list.size())).append(" | ").append(confused).append(" |\n");
        });
        md.append("\n## Ảnh nhận diện sai (để xem lại và chỉnh câu lệnh cho AI)\n\n| Ảnh | Nhãn gốc | Cần ra | AI ra |\n|---|---|---|---|\n");
        results.stream().filter(r -> r.error() != null || !r.top()).forEach(r -> md.append("| [")
                .append(r.row().image(), 0, 8).append("](").append(IMAGES).append(r.row().image()).append(".jpg) | ")
                .append(r.row().label()).append(" | ").append(r.row().expected()).append(" | ")
                .append(r.error() != null ? "Lỗi: " + r.error().replace('|', '/') : r.predicted()).append(" |\n"));
        return md.toString();
    }

    private static String row(String name, String value) {
        return "| " + name + " | " + value + " |\n";
    }

    private static String pct(long part, long total) {
        return total == 0 ? "—" : String.format("%.1f%% (%d/%d)", 100.0 * part / total, part, total);
    }
}
