package vn.thelooks.wardrobe.domain.model;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Một lần quét: người dùng gửi 1..10 ảnh, mỗi ảnh có thể chứa nhiều món (outfit đang mặc, đồ trải trên giường).
 * Ảnh gốc không được lưu lại: chỉ lưu ảnh đã cắt của từng món.
 *
 * @param itemIds         các món đã tạo (PENDING_REVIEW), chờ người dùng xác nhận
 * @param skippedForLimit số món tìm thấy nhưng không tạo vì tủ đồ đã đủ số món của gói
 */
public record Scan(
        UUID id,
        UUID ownerId,
        ScanStatus status,
        int imageCount,
        List<UUID> itemIds,
        int skippedForLimit,
        Instant createdAt) {
}
