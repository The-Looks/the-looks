package vn.thelooks.voting.application.port.out;

import java.util.Optional;
import java.util.UUID;
import vn.thelooks.voting.domain.model.PollOption;

/** Lấy ảnh outfit để tạo bình chọn. Cài đặt: client gọi outfit-service GET /api/app/outfits/{id} (chuyển tiếp JWT). */
public interface OutfitReader {

    /** Rỗng nếu outfit không tồn tại hoặc không thuộc ownerId. */
    Optional<PollOption> snapshot(UUID ownerId, UUID outfitId);
}
