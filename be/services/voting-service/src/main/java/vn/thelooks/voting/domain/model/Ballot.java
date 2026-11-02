package vn.thelooks.voting.domain.model;

import java.time.Instant;
import java.util.UUID;
import vn.thelooks.voting.domain.enums.Choice;

/**
 * Một lượt bình chọn ẩn danh.
 *
 * @param voterKey hash của mã cookie theo từng poll để chặn bình chọn trùng
 * @param ipKey    hash của IP theo từng poll, để giới hạn số phiếu từ một mạng
 */
public record Ballot(
        UUID id,
        UUID pollId,
        Choice choice,
        String voterKey,
        String ipKey,
        Instant castAt) {
}
