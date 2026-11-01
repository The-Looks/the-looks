package vn.thelooks.voting.infrastructure.persistence.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.thelooks.voting.domain.enums.Choice;
import vn.thelooks.voting.infrastructure.persistence.entity.BallotJpaEntity;

public interface SpringDataBallotRepository extends JpaRepository<BallotJpaEntity, UUID> {

    boolean existsByPollIdAndVoterKey(UUID pollId, String voterKey);

    long countByPollIdAndIpKey(UUID pollId, String ipKey);

    long countByPollIdAndChoice(UUID pollId, Choice choice);
}
