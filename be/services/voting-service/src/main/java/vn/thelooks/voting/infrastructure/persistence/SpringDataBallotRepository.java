package vn.thelooks.voting.infrastructure.persistence;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.thelooks.voting.domain.model.Choice;

interface SpringDataBallotRepository extends JpaRepository<BallotJpaEntity, UUID> {

    boolean existsByPollIdAndVoterKey(UUID pollId, String voterKey);

    long countByPollIdAndChoice(UUID pollId, Choice choice);
}
