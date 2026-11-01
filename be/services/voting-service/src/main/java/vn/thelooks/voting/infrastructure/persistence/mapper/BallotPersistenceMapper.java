package vn.thelooks.voting.infrastructure.persistence.mapper;

import vn.thelooks.voting.domain.model.Ballot;
import vn.thelooks.voting.infrastructure.persistence.entity.BallotJpaEntity;

public final class BallotPersistenceMapper {

    private BallotPersistenceMapper() {
    }

    public static BallotJpaEntity toEntity(Ballot ballot) {
        return new BallotJpaEntity(ballot.id(), ballot.pollId(), ballot.voterKey(), ballot.choice(), ballot.castAt());
    }
}
