package vn.thelooks.voting.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface SpringDataPollRepository extends JpaRepository<PollJpaEntity, UUID> {

    Optional<PollJpaEntity> findByCode(String code);

    List<PollJpaEntity> findByOwnerIdOrderByCreatedAtDesc(UUID ownerId);
}
