package vn.thelooks.voting.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import vn.thelooks.voting.domain.enums.Choice;

@Entity
@Table(name = "ballots")
public class BallotJpaEntity extends BaseEntity {

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

    public BallotJpaEntity(UUID id, UUID pollId, String voterKey, Choice choice, Instant castAt) {
        this.id = id;
        this.pollId = pollId;
        this.voterKey = voterKey;
        this.choice = choice;
        this.castAt = castAt;
    }
}
