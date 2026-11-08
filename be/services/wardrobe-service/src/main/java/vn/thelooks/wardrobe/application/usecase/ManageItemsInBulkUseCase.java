package vn.thelooks.wardrobe.application.usecase;

import java.util.List;
import java.util.UUID;
import vn.thelooks.wardrobe.domain.model.ClothingItem;
import vn.thelooks.wardrobe.domain.model.ItemStatus;

/** Thao tác nhiều món cùng lúc (1..100 món); lỗi một món thì không đổi món nào. */
public interface ManageItemsInBulkUseCase {

    int MAX_ITEMS = 100;

    /** Chuyển giữa CONFIRMED, ARCHIVED, SOLD. */
    List<ClothingItem> changeStatus(UUID ownerId, List<UUID> itemIds, ItemStatus status);

    /** Xoá món và ảnh của chúng. */
    void deleteAll(UUID ownerId, List<UUID> itemIds);
}
