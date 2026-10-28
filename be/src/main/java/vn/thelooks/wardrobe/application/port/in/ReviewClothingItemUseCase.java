package vn.thelooks.wardrobe.application.port.in;

import java.util.UUID;
import vn.thelooks.wardrobe.domain.ClothingAttributes;
import vn.thelooks.wardrobe.domain.ClothingItem;

/** Người dùng kiểm tra kết quả AI: xác nhận (kèm chỉnh sửa) hoặc sửa món đã xác nhận. */
public interface ReviewClothingItemUseCase {

    /** PENDING_REVIEW → CONFIRMED, lưu thuộc tính người dùng đã sửa. */
    ClothingItem confirm(UUID ownerId, UUID itemId, ClothingAttributes attributes);

    /** Sửa thuộc tính món đã CONFIRMED. */
    ClothingItem update(UUID ownerId, UUID itemId, ClothingAttributes attributes);
}
