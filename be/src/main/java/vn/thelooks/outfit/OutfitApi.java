package vn.thelooks.outfit;

import java.util.Optional;
import java.util.UUID;

/** API công khai của module outfit. Module voting lấy ảnh outfit để tạo bình chọn qua đây. */
public interface OutfitApi {

    /** Rỗng nếu outfit không tồn tại hoặc không thuộc ownerId. */
    Optional<OutfitView> find(UUID ownerId, UUID outfitId);
}
