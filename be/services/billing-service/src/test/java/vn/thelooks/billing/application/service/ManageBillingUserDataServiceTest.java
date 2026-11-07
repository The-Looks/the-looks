package vn.thelooks.billing.application.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import vn.thelooks.billing.application.port.out.BillingUserDataRepositoryPort;
import vn.thelooks.billing.application.port.out.PaymentGateway;

class ManageBillingUserDataServiceTest {
    @Test
    void paidOrUncertainOrderKeepsAccountDataForReconciliation() {
        var repository = mock(BillingUserDataRepositoryPort.class);
        var gateway = mock(PaymentGateway.class);
        UUID userId = UUID.randomUUID();
        when(repository.pendingOrderCodes(userId)).thenReturn(List.of(100001L));
        when(gateway.cancelUnpaid(100001L)).thenReturn(false);

        var service = new ManageBillingUserDataService(repository, gateway);
        assertThrows(ResponseStatusException.class, () -> service.delete(userId));

        verify(repository, never()).markCancelled(userId, 100001L);
        verify(repository, never()).delete(userId);
    }
}
