package vn.thelooks.voting.domain.model;

import java.net.URI;
import java.util.List;
import java.util.UUID;

/** Ảnh outfit chụp lại lúc tạo bình chọn, để bình chọn không đổi khi outfit gốc bị sửa/xoá. */
public record PollOption(UUID outfitId, List<URI> imageUrls) {
}
