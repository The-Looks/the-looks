package vn.thelooks.voting.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import vn.thelooks.voting.domain.model.Ballot;
import vn.thelooks.voting.domain.model.Choice;

@Entity
@Table(name = "ballots")
class BallotJpaEntity extends BaseEntity {

    @Id
    private UUID id;

    @Column(name = "poll_id", nullable = false)
    private UUID pollId;

    @Column(name = "voter_key", nullable = false, length = 64)
    private String voterKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 8)
    private Choice choice;

    @Column(name = "cast_at", nullable = false)
    private Instant castAt;

    protected BallotJpaEntity() {
    }

    static BallotJpaEntity from(Ballot ballot) {
        var entity = new BallotJpaEntity();
        entity.id = ballot.id();
        entity.pollId = ballot.pollId();
        entity.voterKey = ballot.voterKey();
        entity.choice = ballot.choice();
        entity.castAt = ballot.castAt();
        return entity;
    }
}
