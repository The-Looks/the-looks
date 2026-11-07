package vn.thelooks.wardrobe.application.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.thelooks.wardrobe.application.port.out.*;
import vn.thelooks.wardrobe.domain.model.*;

class WardrobeStatsServiceTest {
    final UUID owner = UUID.randomUUID();
    final Instant now = Instant.parse("2026-11-06T00:00:00Z");
    final ClothingItemRepository items = mock(ClothingItemRepository.class);
    final WearHistoryReader history = mock(WearHistoryReader.class);
    final WardrobeStatsAccess access = mock(WardrobeStatsAccess.class);
    final WardrobeStatsService service = new WardrobeStatsService(items, history, access, Clock.fixed(now, ZoneOffset.UTC));

    @Test
    void calculatesCountsDistinctColorsWearRateAndThirtyDayBoundaryForTheCurrentOwner() {
        var top = item(Category.TOP, List.of(" White ", "white", "BLACK"), 0);
        var bottom = item(Category.BOTTOM, List.of(), 1);
        var shoes = item(Category.SHOES, List.of("white"), 2);
        when(items.findByOwner(owner, ItemStatus.CONFIRMED)).thenReturn(List.of(top, bottom, shoes));
        when(history.lastWornAt(owner)).thenReturn(Map.of(top.id(), now.minusSeconds(30L * 86400), shoes.id(), now.minusSeconds(29L * 86400), UUID.randomUUID(), now));
        var s = service.stats(owner);
        assertThat(s.totalItems()).isEqualTo(3); assertThat(s.wornItems()).isEqualTo(2);
        assertThat(s.neverWornItems()).isEqualTo(1); assertThat(s.wearRatePercent()).isEqualTo(66.7);
        assertThat(s.byCategory()).extracting(c -> c.count()).containsOnly(1L);
        assertThat(s.byColor()).filteredOn(c -> c.key().equals("white")).extracting(c -> c.count()).containsExactly(2L);
        assertThat(s.byColor()).filteredOn(c -> c.key().equals("black")).extracting(c -> c.count()).containsExactly(1L);
        assertThat(s.byColor()).filteredOn(c -> c.key().equals("UNKNOWN")).extracting(c -> c.count()).containsExactly(1L);
        assertThat(s.inactiveCount()).isEqualTo(2);
        assertThat(s.unusedItems()).extracting(i -> i.item().id()).containsExactly(bottom.id(), top.id());
        assertThat(s.unusedItems().getFirst().daysSinceWear()).isNull();
        assertThat(s.unusedItems().getLast().daysSinceWear()).isEqualTo(30L);
        assertThat(s.asOf()).isEqualTo(now);
        var order = inOrder(access, items, history);
        order.verify(access).requireAccess(); order.verify(items).findByOwner(owner, ItemStatus.CONFIRMED); order.verify(history).lastWornAt(owner);
    }
    @Test
    void refusesUnentitledUsersBeforeReadingWardrobeOrHistory() {
        doThrow(new WardrobeStatsAccessDeniedException()).when(access).requireAccess();
        assertThatThrownBy(() -> service.stats(owner)).isInstanceOf(WardrobeStatsAccessDeniedException.class);
        verifyNoInteractions(items, history);
    }
    @Test
    void returnsHonestEmptyStatsWithoutCallingOutfit() {
        when(items.findByOwner(owner, ItemStatus.CONFIRMED)).thenReturn(List.of());
        var s = service.stats(owner);
        assertThat(s.totalItems()).isZero(); assertThat(s.wearRatePercent()).isZero();
        assertThat(s.byCategory()).isEmpty(); assertThat(s.byColor()).isEmpty(); assertThat(s.unusedItems()).isEmpty();
        verifyNoInteractions(history);
    }
    @Test
    void limitsListToTenWithoutTruncatingTotals() {
        var closet = java.util.stream.IntStream.range(0, 15).mapToObj(i -> item(Category.TOP, List.of("white"), i)).toList();
        when(items.findByOwner(owner, ItemStatus.CONFIRMED)).thenReturn(closet);
        when(history.lastWornAt(owner)).thenReturn(Map.of());
        var s = service.stats(owner);
        assertThat(s.inactiveCount()).isEqualTo(15); assertThat(s.neverWornItems()).isEqualTo(15);
        assertThat(s.unusedItems()).hasSize(10);
        assertThat(s.unusedItems()).extracting(i -> i.item().id()).containsExactlyElementsOf(closet.subList(0, 10).stream().map(ClothingItem::id).toList());
    }
    @Test
    void doesNotFabricateZeroWearIfOutfitIsUnavailable() {
        when(items.findByOwner(owner, ItemStatus.CONFIRMED)).thenReturn(List.of(item(Category.TOP, List.of(), 0)));
        when(history.lastWornAt(owner)).thenThrow(new WearHistoryUnavailableException(null));
        assertThatThrownBy(() -> service.stats(owner)).isInstanceOf(WearHistoryUnavailableException.class);
    }
    private ClothingItem item(Category category, List<String> colors, int days) {
        return new ClothingItem(UUID.randomUUID(), owner, "item.jpg", ItemStatus.CONFIRMED,
                new ClothingAttributes(category, colors, null, Set.of(), Set.of()), null, null, now.plusSeconds(days));
    }
}
