package vn.thelooks.outfit.adapter.out.wardrobe;

import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Component;
import vn.thelooks.outfit.application.port.out.WardrobeReader;
import vn.thelooks.outfit.domain.ClosetItem;
import vn.thelooks.wardrobe.WardrobeApi;

/** Đọc tủ đồ qua API công khai của module wardrobe. */
@Component
class WardrobeApiReader implements WardrobeReader {

    private final ObjectProvider<WardrobeApi> wardrobeApi;

    WardrobeApiReader(ObjectProvider<WardrobeApi> wardrobeApi) {
        this.wardrobeApi = wardrobeApi;
    }

    @Override
    public List<ClosetItem> confirmedItems(UUID ownerId) {
        // ponytail: trả rỗng khi module wardrobe chưa cài đặt WardrobeApi; inject WardrobeApi trực tiếp khi wardrobe xong
        WardrobeApi api = wardrobeApi.getIfAvailable();
        if (api == null) {
            return List.of();
        }
        return api.confirmedItems(ownerId).stream()
                .map(v -> new ClosetItem(v.id(), v.category(), v.colors(), v.seasons(), v.styleTags(), v.imageUrl()))
                .toList();
    }
}
