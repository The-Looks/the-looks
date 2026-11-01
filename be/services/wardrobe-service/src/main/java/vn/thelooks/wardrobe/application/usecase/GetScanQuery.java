package vn.thelooks.wardrobe.application.usecase;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import vn.thelooks.wardrobe.domain.model.ClothingItem;
import vn.thelooks.wardrobe.domain.model.Scan;

/** Web hỏi lại mỗi ~2 giây tới khi Scan hết PROCESSING. */
public interface GetScanQuery {

    /** Rỗng nếu không có hoặc không thuộc ownerId. */
    Optional<ScanView> scan(UUID ownerId, UUID scanId);

    record ScanView(Scan scan, List<ClothingItem> items) {
    }
}
