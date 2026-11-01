package vn.thelooks.voting.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "polls")
public class PollJpaEntity extends BaseEntity {

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

    public PollJpaEntity(UUID id, String code, UUID ownerId, String question, UUID outfitAId, UUID outfitBId,
            List<String> optionAImages, List<String> optionBImages, Instant expiresAt) {
        this.id = id;
        this.code = code;
        this.ownerId = ownerId;
        this.question = question;
        this.outfitAId = outfitAId;
        this.outfitBId = outfitBId;
        this.optionAImages = optionAImages;
        this.optionBImages = optionBImages;
        this.expiresAt = expiresAt;
    }

    public UUID getId() { return id; }
    public String getCode() { return code; }
    public UUID getOwnerId() { return ownerId; }
    public String getQuestion() { return question; }
    public UUID getOutfitAId() { return outfitAId; }
    public UUID getOutfitBId() { return outfitBId; }
    public List<String> getOptionAImages() { return optionAImages; }
    public List<String> getOptionBImages() { return optionBImages; }
    public Instant getExpiresAt() { return expiresAt; }
}
