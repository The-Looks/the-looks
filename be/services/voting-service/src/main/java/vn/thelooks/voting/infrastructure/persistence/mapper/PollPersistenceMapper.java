package vn.thelooks.voting.infrastructure.persistence.mapper;

import java.net.URI;
import vn.thelooks.voting.domain.model.Poll;
import vn.thelooks.voting.domain.model.PollOption;
import vn.thelooks.voting.infrastructure.persistence.entity.PollJpaEntity;

public final class PollPersistenceMapper {

    private PollPersistenceMapper() {
    }

    public static PollJpaEntity toEntity(Poll poll) {
        return new PollJpaEntity(poll.id(), poll.code(), poll.ownerId(), poll.question(),
                poll.optionA().outfitId(), poll.optionB().outfitId(),
                poll.optionA().imageUrls().stream().map(URI::toString).toList(),
                poll.optionB().imageUrls().stream().map(URI::toString).toList(), poll.expiresAt());
    }

    public static Poll toDomain(PollJpaEntity entity) {
        return new Poll(entity.getId(), entity.getOwnerId(), entity.getCode(), entity.getQuestion(),
                new PollOption(entity.getOutfitAId(), entity.getOptionAImages().stream().map(URI::create).toList()),
                new PollOption(entity.getOutfitBId(), entity.getOptionBImages().stream().map(URI::create).toList()),
                entity.getExpiresAt(), entity.getCreatedAt());
    }
}
