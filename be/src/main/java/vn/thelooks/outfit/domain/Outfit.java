package vn.thelooks.outfit.domain;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Outfit người dùng đã lưu. */
public record Outfit(
        UUID id,
        UUID ownerId,
        List<UUID> itemIds,
        Occasion occasion,
        Instant createdAt) {
}
