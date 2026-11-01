package vn.thelooks.wardrobe.domain.model;

/**
 * Một món AI tìm thấy trong ảnh.
 *
 * @param confidence 0..1; thấp thì vẫn tạo món nhưng nhắc người dùng kiểm tra kỹ
 */
public record DetectedGarment(ClothingAttributes attributes, BoundingBox box, double confidence) {
}
