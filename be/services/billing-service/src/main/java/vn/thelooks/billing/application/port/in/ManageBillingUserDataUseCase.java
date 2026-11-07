package vn.thelooks.billing.application.port.in;

import java.util.UUID;
import vn.thelooks.billing.domain.model.AdminBillingSummary;

public interface ManageBillingUserDataUseCase {
    AdminBillingSummary summary(UUID userId);
    void delete(UUID userId);
}
