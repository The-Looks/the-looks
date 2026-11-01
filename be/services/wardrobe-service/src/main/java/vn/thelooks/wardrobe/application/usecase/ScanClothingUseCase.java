package vn.thelooks.wardrobe.application.usecase;

import java.util.List;
import java.util.UUID;
import vn.thelooks.wardrobe.domain.model.Scan;

/**
 * Thêm đồ vào tủ bằng ảnh: 1..10 ảnh mỗi lần, mỗi ảnh có thể có nhiều món.
 * Trả về ngay Scan ở trạng thái PROCESSING; AI tìm món, cắt ảnh từng món và tạo các món PENDING_REVIEW chạy nền.
 * Quy trình chạy nền (gợi ý cài đặt):
 * <ol>
 *   <li>Với mỗi ảnh: {@code GarmentDetector.detect} → {@code GarmentSelection.select(detected, chỗ còn trống)}.</li>
 *   <li>Với mỗi món giữ lại: {@code ImageCropper.crop} → {@code ImageStorage.store} → lưu ClothingItem PENDING_REVIEW (kèm scanId).</li>
 *   <li>Không giữ ảnh gốc (có thể có mặt người). Xong hết → Scan DONE; AI lỗi → FAILED.</li>
 * </ol>
 *
 * @throws vn.thelooks.wardrobe.domain.exception.WardrobeFullException tủ đồ đã đủ số món của gói ngay từ đầu
 * @throws vn.thelooks.wardrobe.domain.exception.InvalidImageException ảnh không hợp lệ
 */
public interface ScanClothingUseCase {

    int MAX_IMAGES = 10;
    long MAX_IMAGE_BYTES = 10L * 1024 * 1024;

    Scan start(UUID ownerId, List<UploadedImage> images);

    record UploadedImage(byte[] content, String contentType) {
    }
}
