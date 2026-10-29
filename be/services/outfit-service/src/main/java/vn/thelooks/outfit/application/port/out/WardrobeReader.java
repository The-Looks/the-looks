package vn.thelooks.outfit.application.port.out;

import java.util.List;
import java.util.UUID;
import vn.thelooks.outfit.domain.model.ClosetItem;

/** Đọc đồ đã xác nhận trong tủ. Cài đặt: client gọi wardrobe-service. */
public interface WardrobeReader {

    /** @throws WardrobeUnavailableException khi không gọi được wardrobe-service */
    List<ClosetItem> confirmedItems(UUID ownerId);
}
