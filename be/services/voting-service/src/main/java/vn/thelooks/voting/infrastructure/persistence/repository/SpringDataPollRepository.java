package vn.thelooks.voting.infrastructure.persistence.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.thelooks.voting.infrastructure.persistence.entity.PollJpaEntity;

public interface SpringDataPollRepository extends JpaRepository<PollJpaEntity, UUID> {

    Optional<PollJpaEntity> findByCode(String code);

    List<PollJpaEntity> findByOwnerIdOrderByCreatedAtDesc(UUID ownerId);
}
