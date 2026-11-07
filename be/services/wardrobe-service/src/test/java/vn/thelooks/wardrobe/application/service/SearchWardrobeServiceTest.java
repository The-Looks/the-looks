package vn.thelooks.wardrobe.application.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.thelooks.wardrobe.application.port.out.WardrobeSearchRepository;
import vn.thelooks.wardrobe.application.port.out.WearHistoryReader;
import vn.thelooks.wardrobe.application.port.out.WearHistoryUnavailableException;
import vn.thelooks.wardrobe.application.usecase.SearchWardrobeQuery.Filter;
import vn.thelooks.wardrobe.application.usecase.SearchWardrobeQuery.Sort;

class SearchWardrobeServiceTest {
    @Test
    void onlyRequestsHistoryForWearSortingAndDoesNotSilentlyReturnWrongOrderOnFailure() {
        var items = mock(WardrobeSearchRepository.class); var history = mock(WearHistoryReader.class);
        var service = new SearchWardrobeService(items, history); UUID owner = UUID.randomUUID();
        var newest = new Filter(null, null, null, null, null, null, Sort.NEWEST, 0, 24);
        service.search(owner, newest); verifyNoInteractions(history); verify(items).search(owner, newest, Map.of());
        var old = new Filter(null, null, null, null, null, null, Sort.LEAST_RECENTLY_WORN, 0, 24);
        var map = Map.of(UUID.randomUUID(), Instant.now()); when(history.lastWornAt(owner)).thenReturn(map);
        service.search(owner, old); verify(items).search(owner, old, map);
        when(history.lastWornAt(owner)).thenThrow(new WearHistoryUnavailableException(null));
        assertThatThrownBy(() -> service.search(owner, old)).isInstanceOf(WearHistoryUnavailableException.class);
    }
    @Test
    void rejectsInvalidPagesSizesAndLongTerms() {
        for (int size : new int[] {0, -1, 101}) assertThatThrownBy(() -> new Filter(null, null, null, null, null, null, null, 0, size)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new Filter(null, null, null, null, null, null, null, -1, 24)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new Filter(null, null, null, null, null, "x".repeat(101), null, 0, 24)).isInstanceOf(IllegalArgumentException.class);
    }
}
