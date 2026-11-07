package vn.thelooks.billing.application.port.out;

import java.util.UUID;
import java.util.List;
import vn.thelooks.billing.domain.model.AdminBillingSummary;

public interface BillingUserDataRepositoryPort {
    AdminBillingSummary summary(UUID userId);
    List<Long> pendingOrderCodes(UUID userId);
    boolean markCancelled(UUID userId, long orderCode);
    void delete(UUID userId);
}
