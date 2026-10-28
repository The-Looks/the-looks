package vn.thelooks.outfit.application.port.out;

import java.util.List;
import java.util.UUID;
import vn.thelooks.outfit.domain.ClosetItem;

/** Đọc đồ đã xác nhận trong tủ. Cài đặt: adapter gọi vn.thelooks.wardrobe.WardrobeApi. */
public interface WardrobeReader {

    List<ClosetItem> confirmedItems(UUID ownerId);
}
