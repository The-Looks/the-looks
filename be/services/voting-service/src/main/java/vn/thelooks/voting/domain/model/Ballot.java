package vn.thelooks.voting.domain.model;

import java.time.Instant;
import java.util.UUID;
import vn.thelooks.voting.domain.enums.Choice;

/**
 * Một lượt bình chọn ẩn danh.
 *
 * @param voterKey hash của mã cookie theo từng poll để chặn bình chọn trùng
 */
public record Ballot(
        UUID id,
        UUID pollId,
        Choice choice,
        String voterKey,
        Instant castAt) {
}
