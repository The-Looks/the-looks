package vn.thelooks.wardrobe.application.usecase;

import java.util.UUID;
import vn.thelooks.wardrobe.domain.model.ClothingItem;

/**
 * Upload ảnh quần áo. Trả về ngay món đồ ở trạng thái PROCESSING;
 * AI nhận diện chạy bất đồng bộ rồi chuyển sang PENDING_REVIEW.
 */
public interface UploadClothingUseCase {

    ClothingItem upload(UploadCommand command);

    record UploadCommand(UUID ownerId, byte[] image, String contentType) {
    }
}
