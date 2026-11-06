package vn.thelooks.wardrobe.application.service;

import java.time.Clock;
import java.time.Duration;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import vn.thelooks.wardrobe.application.port.out.ClothingItemRepository;
import vn.thelooks.wardrobe.application.port.out.WardrobeStatsAccess;
import vn.thelooks.wardrobe.application.port.out.WearHistoryReader;
import vn.thelooks.wardrobe.application.usecase.GetWardrobeStatsQuery;
import vn.thelooks.wardrobe.domain.model.ItemStatus;

@Service
class WardrobeStatsService implements GetWardrobeStatsQuery {
    static final int INACTIVE_DAYS = 30;
    private final ClothingItemRepository items;
    private final WearHistoryReader history;
    private final WardrobeStatsAccess access;
    private final Clock clock;
    WardrobeStatsService(ClothingItemRepository items, WearHistoryReader history, WardrobeStatsAccess access, Clock clock) {
        this.items = items; this.history = history; this.access = access; this.clock = clock;
    }
    public Stats stats(UUID ownerId) {
        access.requireAccess(); // Luôn kiểm tra ở backend trước khi đọc dữ liệu riêng tư.
        var closet = items.findByOwner(ownerId, ItemStatus.CONFIRMED);
        var now = clock.instant();
        var worn = closet.isEmpty() ? Map.<UUID, java.time.Instant>of() : history.lastWornAt(ownerId);
        Map<String, Long> categories = new HashMap<>(), colors = new HashMap<>();
        for (var item : closet) {
            var a = item.attributes();
            categories.merge(a == null || a.category() == null ? "UNKNOWN" : a.category().name(), 1L, Long::sum);
            var labels = a == null || a.colors() == null ? List.<String>of() : a.colors().stream()
                    .filter(java.util.Objects::nonNull).map(String::trim).filter(s -> !s.isEmpty())
                    .map(s -> s.toLowerCase(Locale.ROOT)).distinct().toList();
            if (labels.isEmpty()) colors.merge("UNKNOWN", 1L, Long::sum);
            else labels.forEach(color -> colors.merge(color, 1L, Long::sum));
        }
        long wornCount = closet.stream().filter(item -> worn.containsKey(item.id())).count();
        var unused = closet.stream().map(item -> {
            var last = worn.get(item.id());
            return new UnusedItem(item, last, last == null ? null : Math.max(0, Duration.between(last, now).toDays()));
        }).filter(item -> item.lastWornAt() == null || item.daysSinceWear() >= INACTIVE_DAYS)
                .sorted(Comparator.comparing(UnusedItem::lastWornAt, Comparator.nullsFirst(Comparator.naturalOrder()))
                        .thenComparing(item -> item.item().createdAt()).thenComparing(item -> item.item().id())).toList();
        return new Stats(closet.size(), wornCount, closet.size() - wornCount,
                closet.isEmpty() ? 0 : Math.round(1000.0 * wornCount / closet.size()) / 10.0,
                counts(categories), counts(colors), unused.size(), INACTIVE_DAYS, unused.stream().limit(10).toList(), now);
    }
    private List<Count> counts(Map<String, Long> values) {
        return values.entrySet().stream().map(e -> new Count(e.getKey(), e.getValue()))
                .sorted(Comparator.comparingLong(Count::count).reversed().thenComparing(Count::key)).toList();
    }
}
