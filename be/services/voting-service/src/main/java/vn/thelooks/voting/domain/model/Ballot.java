package vn.thelooks.voting.domain.model;

import java.time.Instant;
import java.util.UUID;

/**
 * Một lượt bình chọn ẩn danh.
 *
 * @param voterKey hash (cookie/device id + IP) để chặn bình chọn trùng, không lưu thông tin cá nhân
 */
public record Ballot(
        UUID id,
        UUID pollId,
        Choice choice,
        String voterKey,
        Instant castAt) {
}
