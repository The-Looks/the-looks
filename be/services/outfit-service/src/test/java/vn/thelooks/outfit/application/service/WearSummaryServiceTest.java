package vn.thelooks.outfit.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.thelooks.outfit.application.port.out.WearLogRepository;

class WearSummaryServiceTest {
    @Test
    void aggregatesOnlyTheRequestedOwnersHistoryIncludingWearCounts() {
        var logs = mock(WearLogRepository.class); UUID owner = UUID.randomUUID(), item = UUID.randomUUID();
        Instant date = Instant.parse("2026-11-01T00:00:00Z");
        when(logs.wearCountByItem(owner)).thenReturn(Map.of(item, 10L));
        when(logs.lastWornAtByItem(owner)).thenReturn(Map.of(item, date));
        var result = new WearSummaryService(logs).summary(owner);
        assertThat(result).hasSize(1);
        assertThat(result.getFirst().wearCount()).isEqualTo(10);
        assertThat(result.getFirst().itemId()).isEqualTo(item);
        assertThat(result.getFirst().lastWornAt()).isEqualTo(date);
        verify(logs).wearCountByItem(owner); verify(logs).lastWornAtByItem(owner); verifyNoMoreInteractions(logs);
    }
}
