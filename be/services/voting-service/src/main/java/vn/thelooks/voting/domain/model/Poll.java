package vn.thelooks.voting.domain.model;

import java.time.Instant;
import java.util.UUID;

/**
 * Một bình chọn A/B.
 *
 * @param code mã ngẫu nhiên khó đoán trong link chia sẻ /v/{code}
 */
public record Poll(
        UUID id,
        UUID ownerId,
        String code,
        String question,
        PollOption optionA,
        PollOption optionB,
        Instant expiresAt,
        Instant createdAt) {

    public boolean isExpired(Instant now) {
        return now.isAfter(expiresAt);
    }
}
