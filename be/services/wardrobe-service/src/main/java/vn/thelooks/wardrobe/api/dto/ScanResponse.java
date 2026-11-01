package vn.thelooks.wardrobe.api.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import vn.thelooks.wardrobe.domain.model.ScanStatus;

public record ScanResponse(UUID id, ScanStatus status, int imageCount, List<ItemResponse> items, int skippedForLimit,
        Instant createdAt) {
}
