package vn.thelooks.wardrobe.application.service;

import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import vn.thelooks.wardrobe.application.port.out.WardrobeSearchRepository;
import vn.thelooks.wardrobe.application.port.out.WearHistoryReader;
import vn.thelooks.wardrobe.application.usecase.SearchWardrobeQuery;

@Service
class SearchWardrobeService implements SearchWardrobeQuery {
    private final WardrobeSearchRepository items;
    private final WearHistoryReader history;
    SearchWardrobeService(WardrobeSearchRepository items, WearHistoryReader history) {
        this.items = items; this.history = history;
    }
    public Page search(UUID ownerId, Filter filter) {
        return items.search(ownerId, filter,
                filter.sort() == Sort.LEAST_RECENTLY_WORN ? history.lastWornAt(ownerId) : Map.of());
    }
}
