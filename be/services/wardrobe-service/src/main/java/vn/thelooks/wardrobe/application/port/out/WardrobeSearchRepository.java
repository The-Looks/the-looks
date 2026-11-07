package vn.thelooks.wardrobe.application.port.out;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import vn.thelooks.wardrobe.application.usecase.SearchWardrobeQuery.Filter;
import vn.thelooks.wardrobe.application.usecase.SearchWardrobeQuery.Page;

public interface WardrobeSearchRepository {
    Page search(UUID ownerId, Filter filter, Map<UUID, Instant> lastWornAt);
}
