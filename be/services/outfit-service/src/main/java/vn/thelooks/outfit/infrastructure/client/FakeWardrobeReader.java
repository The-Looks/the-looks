package vn.thelooks.outfit.infrastructure.client;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import vn.thelooks.outfit.application.port.out.WardrobeReader;
import vn.thelooks.outfit.domain.model.ClosetItem;

/**
 * Tủ đồ mẫu cho demo/dev khi wardrobe-service chưa sẵn sàng. Bật bằng profile "demo"
 * (thelooks.services.wardrobe-fake=true). ID trùng với fe/web-app/src/shared/mocks/data.ts.
 *
 * <p>Mọi người dùng thấy chung một tủ đồ — chỉ dùng để demo, không dùng ở production.
 */
@Component
@ConditionalOnProperty(name = "thelooks.services.wardrobe-fake", havingValue = "true")
class FakeWardrobeReader implements WardrobeReader {

    private static final List<ClosetItem> CLOSET = List.of(
            item(1, "TOP", "white", "formal", "office", "minimal"),
            item(2, "TOP", "cream", "casual", "feminine"),
            item(3, "TOP", "black", "casual", "streetwear", "basic"),
            item(4, "BOTTOM", "denim", "casual", "streetwear"),
            item(5, "BOTTOM", "black", "office", "formal"),
            item(6, "BOTTOM", "pink", "feminine", "romantic", "preppy"),
            item(7, "DRESS", "lavender", "romantic", "elegant", "feminine"),
            item(8, "SHOES", "white", "casual", "sporty"),
            item(9, "SHOES", "brown", "formal", "office"),
            item(10, "OUTERWEAR", "lavender", "office", "smart-casual"));

    private static ClosetItem item(int n, String category, String color, String... tags) {
        UUID id = UUID.fromString("00000000-0000-4000-8000-0000000000%02d".formatted(n));
        return new ClosetItem(id, category, List.of(color), Set.of(), Set.of(tags), null);
    }

    @Override
    public List<ClosetItem> confirmedItems(UUID ownerId) {
        return CLOSET;
    }
}
