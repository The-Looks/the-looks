package vn.thelooks.billing.infrastructure.persistence;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.never;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

class BillingUserDataRepositoryAdapterTest {
    @Test
    void pendingPaymentPreventsAccountDataDeletion() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        UUID userId = UUID.randomUUID();
        when(jdbc.queryForObject(anyString(), eq(Long.class), any())).thenReturn(0L, 1L);

        var adapter = new BillingUserDataRepositoryAdapter(jdbc);
        assertThrows(ResponseStatusException.class, () -> adapter.delete(userId));

        verify(jdbc, never()).update(anyString(), (Object[]) any());
    }
}
