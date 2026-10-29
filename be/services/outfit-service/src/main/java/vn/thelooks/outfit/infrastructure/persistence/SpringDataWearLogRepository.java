package vn.thelooks.outfit.infrastructure.persistence;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SpringDataWearLogRepository extends JpaRepository<WearLogJpaEntity, UUID> {

    /** Mỗi dòng: [itemId (UUID), lần mặc gần nhất (Instant)]. */
    @Query("select i, max(w.wornAt) from WearLogJpaEntity w join w.itemIds i where w.ownerId = :ownerId group by i")
    List<Object[]> lastWornAtByItem(@Param("ownerId") UUID ownerId);
}
