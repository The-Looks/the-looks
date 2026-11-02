package vn.thelooks.wardrobe.application.port.out;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;
import vn.thelooks.wardrobe.domain.model.Scan;

public interface ScanRepository {

    Scan save(Scan scan);

    /**
     * Lưu lần quét mới, trừ khi cùng người đã gửi đúng nội dung này trong {@code window}: khi đó trả lần quét cũ.
     * Hai request tới cùng lúc cũng chỉ tạo một lần quét.
     */
    Scan saveUnlessDuplicate(Scan scan, String contentHash, Duration window);

    Optional<Scan> findById(UUID id);
}
