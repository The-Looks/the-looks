package vn.thelooks.outfit.api.dto;

import java.net.URI;
import java.util.UUID;
import vn.thelooks.outfit.domain.model.ClosetItem;

public record OutfitItemResponse(UUID id, String category, URI imageUrl) {

    public static OutfitItemResponse from(ClosetItem item) {
        return new OutfitItemResponse(item.id(), item.category(), item.imageUrl());
    }
}
