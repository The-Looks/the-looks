package vn.thelooks.voting.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.thelooks.voting.domain.model.Poll;
import vn.thelooks.voting.domain.model.PollOption;

@Entity
@Table(name = "polls")
class PollJpaEntity extends BaseEntity {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true, length = 32)
    private String code;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(length = 140)
    private String question;

    @Column(name = "outfit_a_id", nullable = false)
    private UUID outfitAId;

    @Column(name = "outfit_b_id", nullable = false)
    private UUID outfitBId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "option_a_images", nullable = false, columnDefinition = "jsonb")
    private List<String> optionAImages;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "option_b_images", nullable = false, columnDefinition = "jsonb")
    private List<String> optionBImages;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    protected PollJpaEntity() {
    }

    static PollJpaEntity from(Poll poll) {
        var entity = new PollJpaEntity();
        entity.id = poll.id();
        entity.code = poll.code();
        entity.ownerId = poll.ownerId();
        entity.question = poll.question();
        entity.outfitAId = poll.optionA().outfitId();
        entity.outfitBId = poll.optionB().outfitId();
        entity.optionAImages = poll.optionA().imageUrls().stream().map(URI::toString).toList();
        entity.optionBImages = poll.optionB().imageUrls().stream().map(URI::toString).toList();
        entity.expiresAt = poll.expiresAt();
        return entity;
    }

    Poll toDomain() {
        return new Poll(id, ownerId, code, question,
                new PollOption(outfitAId, optionAImages.stream().map(URI::create).toList()),
                new PollOption(outfitBId, optionBImages.stream().map(URI::create).toList()),
                expiresAt, getCreatedAt());
    }
}
