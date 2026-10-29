package vn.thelooks.outfit.domain.model;

import java.net.URI;
import java.util.List;

/** Outfit kèm ảnh các món, dùng cho voting-service tạo bình chọn. */
public record OutfitView(Outfit outfit, List<URI> itemImageUrls) {
}
