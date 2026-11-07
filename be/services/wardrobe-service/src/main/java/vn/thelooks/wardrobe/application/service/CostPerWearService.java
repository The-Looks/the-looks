package vn.thelooks.wardrobe.application.service;

import java.util.Comparator;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import vn.thelooks.wardrobe.application.port.out.ClothingItemRepository;
import vn.thelooks.wardrobe.application.port.out.CostPerWearAccess;
import vn.thelooks.wardrobe.application.port.out.WearCountReader;
import vn.thelooks.wardrobe.application.usecase.GetCostPerWearQuery;
import vn.thelooks.wardrobe.domain.exception.ClothingItemNotFoundException;
import vn.thelooks.wardrobe.domain.exception.InvalidItemStateException;
import vn.thelooks.wardrobe.domain.model.ClothingItem;
import vn.thelooks.wardrobe.domain.model.CostPerWear;
import vn.thelooks.wardrobe.domain.model.ItemStatus;

@Service
class CostPerWearService implements GetCostPerWearQuery {
    private final ClothingItemRepository items;
    private final WearCountReader history;
    private final CostPerWearAccess access;
    CostPerWearService(ClothingItemRepository items, WearCountReader history, CostPerWearAccess access) {
        this.items = items; this.history = history; this.access = access;
    }
    public Entry item(UUID ownerId, UUID itemId) {
        access.requireCostAccess();
        var item = items.findById(itemId).filter(i -> i.ownerId().equals(ownerId))
                .orElseThrow(() -> new ClothingItemNotFoundException("Không tìm thấy món đồ"));
        if (item.status() != ItemStatus.CONFIRMED) throw new InvalidItemStateException("Xác nhận món đồ trước khi xem chi phí mỗi lần mặc");
        return calculate(item, history.wearCounts(ownerId));
    }
    public Summary summary(UUID ownerId) {
        access.requireCostAccess();
        var closet = items.findByOwner(ownerId, ItemStatus.CONFIRMED);
        var counts = closet.isEmpty() ? Map.<UUID, Long>of() : history.wearCounts(ownerId);
        var rows = closet.stream().map(item -> calculate(item, counts))
                .sorted(Comparator.comparing((Entry e) -> e.cost().amount(), Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(e -> e.item().createdAt(), Comparator.reverseOrder()).thenComparing(e -> e.item().id()))
                .limit(10).toList();
        return new Summary(rows, closet.size());
    }
    private Entry calculate(ClothingItem item, Map<UUID, Long> counts) {
        var price = item.attributes() == null ? null : item.attributes().purchasePrice();
        return new Entry(item, CostPerWear.calculate(price, counts.getOrDefault(item.id(), 0L)));
    }
}
