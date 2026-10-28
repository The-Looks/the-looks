package vn.thelooks.wardrobe;

import java.util.List;
import java.util.UUID;

/** API công khai của module wardrobe. Module khác (outfit) chỉ được đọc tủ đồ qua interface này. */
public interface WardrobeApi {

    /** Chỉ trả món đồ đã CONFIRMED. */
    List<WardrobeItemView> confirmedItems(UUID ownerId);
}
