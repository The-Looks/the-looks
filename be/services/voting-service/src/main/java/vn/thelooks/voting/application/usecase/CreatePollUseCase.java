package vn.thelooks.voting.application.usecase;

import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

public interface CreatePollUseCase {

    CreatedPoll create(CreatePollCommand command);

    /** @param ttl thời hạn link, ví dụ 24h */
    record CreatePollCommand(UUID ownerId, UUID outfitAId, UUID outfitBId, String question, Duration ttl) {
    }

    /** @param shareUrl link gửi qua Zalo, mở trên voting-web */
    record CreatedPoll(String code, URI shareUrl, Instant expiresAt) {
    }
}
