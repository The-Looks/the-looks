package vn.thelooks.wardrobe.infrastructure.ai;

import java.util.List;
import java.util.Set;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import vn.thelooks.wardrobe.application.port.out.GarmentDetector;
import vn.thelooks.wardrobe.domain.model.BoundingBox;
import vn.thelooks.wardrobe.domain.model.Category;
import vn.thelooks.wardrobe.domain.model.ClothingAttributes;
import vn.thelooks.wardrobe.domain.model.DetectedGarment;

/**
 * Khi chưa bật AI (thelooks.ai.provider=none): mỗi ảnh coi như có áo ở nửa trên và quần ở nửa dưới,
 * để chạy thử trọn luồng quét nhiều món mà không tốn tiền. Người dùng vẫn sửa được ở bước xác nhận.
 */
@Component
@ConditionalOnProperty(name = "thelooks.ai.provider", havingValue = "none", matchIfMissing = true)
class FakeGarmentDetector implements GarmentDetector {

    @Override
    public List<DetectedGarment> detect(byte[] image, String contentType) {
        return List.of(
                new DetectedGarment(new ClothingAttributes(Category.TOP, List.of("white"), null, Set.of(), Set.of("casual")),
                        new BoundingBox(0.05, 0.0, 0.9, 0.5), 0.5),
                new DetectedGarment(new ClothingAttributes(Category.BOTTOM, List.of("denim"), null, Set.of(), Set.of("casual")),
                        new BoundingBox(0.05, 0.5, 0.9, 0.5), 0.5));
    }
}
