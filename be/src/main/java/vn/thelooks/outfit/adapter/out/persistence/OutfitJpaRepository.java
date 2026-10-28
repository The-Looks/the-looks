package vn.thelooks.outfit.adapter.out.persistence;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OutfitJpaRepository extends JpaRepository<OutfitEntity, UUID> {

    List<OutfitEntity> findByOwnerIdOrderByCreatedAtDesc(UUID ownerId);
}
