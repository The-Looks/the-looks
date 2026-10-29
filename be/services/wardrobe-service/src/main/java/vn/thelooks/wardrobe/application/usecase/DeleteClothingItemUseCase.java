package vn.thelooks.wardrobe.application.usecase;

import java.util.UUID;

/** Xoá món đồ và ảnh của nó. */
public interface DeleteClothingItemUseCase {

    void delete(UUID ownerId, UUID itemId);
}
