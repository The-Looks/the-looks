package vn.thelooks.wardrobe.application.usecase;

import java.util.UUID;
import java.util.List;
import vn.thelooks.wardrobe.domain.model.ClothingAttributes;
import vn.thelooks.wardrobe.domain.model.ClothingItem;

/** Người dùng kiểm tra kết quả AI: xác nhận (kèm chỉnh sửa) hoặc sửa món đã xác nhận. */
public interface ReviewClothingItemUseCase {

    record Confirmation(UUID itemId, ClothingAttributes attributes) {}

    /** Xác nhận toàn bộ danh sách trong cùng transaction, không lưu một phần. */
    List<ClothingItem> confirmAll(UUID ownerId, List<Confirmation> confirmations);

    /** PENDING_REVIEW → CONFIRMED, lưu thuộc tính người dùng đã sửa. */
    ClothingItem confirm(UUID ownerId, UUID itemId, ClothingAttributes attributes);

    /** Sửa thuộc tính món đã CONFIRMED. */
    ClothingItem update(UUID ownerId, UUID itemId, ClothingAttributes attributes);
}
