package vn.thelooks.wardrobe.application.usecase;

import java.util.Optional;
import java.util.UUID;
import vn.thelooks.wardrobe.domain.model.Scan;

/** Web hỏi lại mỗi ~2 giây tới khi Scan hết PROCESSING. */
public interface GetScanQuery {

    /** Rỗng nếu không có hoặc không thuộc ownerId. */
    Optional<Scan> get(UUID ownerId, UUID scanId);
}
