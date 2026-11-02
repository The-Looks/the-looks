package vn.thelooks.observability;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.regex.Pattern;
import org.springframework.core.Ordered;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

/**
 * Header {@code Idempotency-Key}: request ghi (POST/PUT/PATCH/DELETE) gửi lại với cùng key thì nhận lại đúng
 * response lần đầu, không chạy lại. Chống tạo trùng khi người dùng bấm 2 lần hoặc mạng/proxy gửi lại.
 * <ul>
 *   <li>Key gắn với người gửi (hash của header Authorization) và method + đường dẫn: không đọc được response của người khác.</li>
 *   <li>Request trùng tới khi lần đầu còn đang chạy thì chờ lần đầu xong rồi trả cùng kết quả.</li>
 *   <li>Lỗi 5xx không được nhớ: gửi lại là chạy lại.</li>
 *   <li>Không có header thì chạy bình thường (webhook SePay, client cũ).</li>
 * </ul>
 * ponytail: nhớ trong RAM, đủ cho mỗi service 1 máy (Render free); chạy nhiều máy thì chuyển sang bảng DB hoặc Redis.
 */
public class IdempotencyFilter extends OncePerRequestFilter implements Ordered {

    public static final String HEADER = "Idempotency-Key";
    public static final String REPLAYED_HEADER = "Idempotent-Replayed";
    static final Duration TTL = Duration.ofHours(24);
    static final Duration WAIT_FOR_FIRST = Duration.ofSeconds(60);
    static final int MAX_ENTRIES = 10_000;
    private static final Set<String> WRITE_METHODS = Set.of("POST", "PUT", "PATCH", "DELETE");
    private static final Pattern VALID = Pattern.compile("[A-Za-z0-9_-]{8,100}");

    record Saved(int status, String contentType, byte[] body, Instant at) {
    }

    private final Map<String, CompletableFuture<Saved>> responses = new ConcurrentHashMap<>();
    private final Clock clock;

    public IdempotencyFilter() {
        this(Clock.systemUTC());
    }

    IdempotencyFilter(Clock clock) {
        this.clock = clock;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !WRITE_METHODS.contains(request.getMethod()) || request.getHeader(HEADER) == null;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String key = request.getHeader(HEADER);
        if (!VALID.matcher(key).matches()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, HEADER + " phải gồm 8–100 ký tự chữ, số, - hoặc _");
            return;
        }
        String slot = sha256(Objects.toString(request.getHeader("Authorization"), "")) + ' ' + request.getMethod() + ' '
                + request.getRequestURI() + ' ' + key;
        evictOld();
        var mine = new CompletableFuture<Saved>();
        CompletableFuture<Saved> first = responses.putIfAbsent(slot, mine);
        if (first != null) {
            replay(first, response);
            return;
        }
        var wrapper = new ContentCachingResponseWrapper(response);
        try {
            chain.doFilter(request, wrapper);
        } catch (IOException | ServletException | RuntimeException e) {
            responses.remove(slot);
            mine.completeExceptionally(e);
            throw e;
        }
        var saved = new Saved(wrapper.getStatus(), wrapper.getContentType(), wrapper.getContentAsByteArray(), clock.instant());
        if (saved.status() >= 500) {
            responses.remove(slot);
        }
        mine.complete(saved);
        wrapper.copyBodyToResponse();
    }

    private void replay(CompletableFuture<Saved> first, HttpServletResponse response) throws IOException {
        Saved saved;
        try {
            saved = first.get(WAIT_FOR_FIRST.toSeconds(), TimeUnit.SECONDS);
        } catch (ExecutionException | TimeoutException e) {
            response.sendError(HttpServletResponse.SC_CONFLICT, "Request trùng đang được xử lý hoặc đã lỗi, thử lại sau");
            return;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException(e);
        }
        response.setStatus(saved.status());
        if (saved.contentType() != null) {
            response.setContentType(saved.contentType());
        }
        response.setHeader(REPLAYED_HEADER, "true");
        response.getOutputStream().write(saved.body());
    }

    private void evictOld() {
        if (responses.size() < MAX_ENTRIES) {
            return;
        }
        Instant cutoff = clock.instant().minus(TTL);
        responses.values().removeIf(f -> f.isDone() && (f.isCompletedExceptionally() || f.join().at().isBefore(cutoff)));
        if (responses.size() >= MAX_ENTRIES) { // vẫn đầy: bỏ hết kết quả đã xong, chỉ giữ request đang chạy
            responses.values().removeIf(CompletableFuture::isDone);
        }
    }

    private static String sha256(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    /** Sau CorrelationIdFilter (để log có ID), trước Spring Security. */
    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 1;
    }
}
