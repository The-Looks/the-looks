package vn.thelooks.outfit;

import java.net.URI;
import java.util.List;
import java.util.UUID;

public record OutfitView(UUID id, List<URI> itemImageUrls) {
}
