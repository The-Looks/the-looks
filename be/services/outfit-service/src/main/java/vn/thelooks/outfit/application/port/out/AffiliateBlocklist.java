package vn.thelooks.outfit.application.port.out;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/** Sản phẩm affiliate bị admin chặn. Khoá = nguồn + mã sản phẩm. */
public interface AffiliateBlocklist {

    record Blocked(String source, String productId, String title, UUID blockedBy, Instant blockedAt) {}

    /** "SOURCE:productId" của mọi sản phẩm bị chặn, để lọc nhanh khi gợi ý. */
    Set<String> keys();

    List<Blocked> list();

    void block(String source, String productId, String title, UUID adminId, Instant at);

    void unblock(String source, String productId);

    static String key(String source, String productId) {
        return source + ':' + productId;
    }
}
