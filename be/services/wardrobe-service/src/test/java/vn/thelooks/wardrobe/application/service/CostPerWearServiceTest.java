package vn.thelooks.wardrobe.application.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.Test;
import vn.thelooks.wardrobe.application.port.out.*;
import vn.thelooks.wardrobe.domain.exception.ClothingItemNotFoundException;
import vn.thelooks.wardrobe.domain.exception.InvalidItemStateException;
import vn.thelooks.wardrobe.domain.model.*;

class CostPerWearServiceTest {
    final UUID owner = UUID.randomUUID();
    final ClothingItemRepository items = mock(ClothingItemRepository.class);
    final WearCountReader history = mock(WearCountReader.class);
    final CostPerWearAccess access = mock(CostPerWearAccess.class);
    final CostPerWearService service = new CostPerWearService(items, history, access);
    @Test
    void usesCurrentSavedPriceAndActualWearCountOnEveryRead() {
        var original = item("300000"); when(items.findById(original.id())).thenReturn(Optional.of(original));
        when(history.wearCounts(owner)).thenReturn(Map.of(original.id(), 10L));
        assertThat(service.item(owner, original.id()).cost().amount()).isEqualByComparingTo("30000");
        var updated = original.withStatus(ItemStatus.CONFIRMED, new ClothingAttributes(Category.TOP, List.of(), null, Set.of(), Set.of(), new BigDecimal("200000"), null, null));
        when(items.findById(original.id())).thenReturn(Optional.of(updated)); when(history.wearCounts(owner)).thenReturn(Map.of(original.id(), 20L));
        assertThat(service.item(owner, original.id()).cost().amount()).isEqualByComparingTo("10000");
    }
    @Test
    void enforcesCostFeatureBeforeReadingAnyItem() {
        doThrow(new CostPerWearAccessDeniedException()).when(access).requireCostAccess();
        assertThatThrownBy(() -> service.item(owner, UUID.randomUUID())).isInstanceOf(CostPerWearAccessDeniedException.class);
        assertThatThrownBy(() -> service.summary(owner)).isInstanceOf(CostPerWearAccessDeniedException.class);
        verifyNoInteractions(items, history);
    }
    @Test
    void protectsOwnershipAndRejectsUnconfirmedItemsBeforeReadingHistory() {
        var row = item("300000"); when(items.findById(row.id())).thenReturn(Optional.of(row));
        assertThatThrownBy(() -> service.item(UUID.randomUUID(), row.id())).isInstanceOf(ClothingItemNotFoundException.class);
        when(items.findById(row.id())).thenReturn(Optional.of(row.withStatus(ItemStatus.PENDING_REVIEW, row.attributes())));
        assertThatThrownBy(() -> service.item(owner, row.id())).isInstanceOf(InvalidItemStateException.class);
        verifyNoInteractions(history);
    }
    @Test
    void summarizesWithOneHistoryCallAndKeepsTotalBeyondTenRows() {
        var closet = java.util.stream.IntStream.rangeClosed(1, 12).mapToObj(i -> item(String.valueOf(i * 1000))).toList();
        when(items.findByOwner(owner, ItemStatus.CONFIRMED)).thenReturn(closet);
        Map<UUID, Long> counts = new HashMap<>(); closet.forEach(i -> counts.put(i.id(), 10L));
        when(history.wearCounts(owner)).thenReturn(counts);
        var s = service.summary(owner);
        assertThat(s.totalItems()).isEqualTo(12); assertThat(s.items()).hasSize(10);
        assertThat(s.items().getFirst().cost().amount()).isEqualByComparingTo("1200");
        verify(history, times(1)).wearCounts(owner);
    }
    @Test
    void distinguishesAbsentHistoryFromServiceFailureAndHandlesEmptyCloset() {
        var row = item("300000"); when(items.findById(row.id())).thenReturn(Optional.of(row));
        when(history.wearCounts(owner)).thenReturn(Map.of(UUID.randomUUID(), 10L));
        assertThat(service.item(owner, row.id()).cost().status()).isEqualTo(CostPerWear.Status.NEVER_WORN);
        when(history.wearCounts(owner)).thenThrow(new WearHistoryUnavailableException(null));
        assertThatThrownBy(() -> service.item(owner, row.id())).isInstanceOf(WearHistoryUnavailableException.class);
        when(items.findByOwner(owner, ItemStatus.CONFIRMED)).thenReturn(List.of());
        assertThat(service.summary(owner).items()).isEmpty();
    }
    private ClothingItem item(String price) {
        return new ClothingItem(UUID.randomUUID(), owner, "item.jpg", ItemStatus.CONFIRMED,
                new ClothingAttributes(Category.TOP, List.of(), null, Set.of(), Set.of(), new BigDecimal(price), null, null), null, null, Instant.now());
    }
}
