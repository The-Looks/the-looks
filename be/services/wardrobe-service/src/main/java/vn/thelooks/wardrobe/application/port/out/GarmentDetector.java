package vn.thelooks.wardrobe.application.port.out;

import java.util.List;
import vn.thelooks.wardrobe.domain.model.DetectedGarment;

/**
 * AI tìm mọi món đồ trong một ảnh, mỗi món kèm khung bao (toạ độ 0..1), loại, màu, chất liệu, mùa, phong cách.
 * Đề xuất cho MVP: Claude Haiku 5.5 (vision, structured output) — cùng nhà cung cấp với outfit-service.
 * Ảnh chỉ có một món thì trả về một phần tử, khung có thể là {@code BoundingBox.whole()}.
 * Không tìm thấy món nào → danh sách rỗng.
 */
public interface GarmentDetector {

    List<DetectedGarment> detect(byte[] image, String contentType);
}
