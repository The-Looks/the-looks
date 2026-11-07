package vn.thelooks.billing.application.port.out;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import vn.thelooks.billing.domain.model.BillingPeriod;
import vn.thelooks.billing.domain.model.Plan;

public interface RenewalReminderRepository {

    void saveContact(UUID ownerId, String email);

    /**
     * Gói đang tự gia hạn, hết hạn trong (now, now + REMIND_BEFORE], có email, và chưa được nhắc cho kỳ hết hạn này.
     */
    List<Due> due(Instant now);

    void markReminded(UUID ownerId, Instant expiresAt);

    record Due(UUID ownerId, String email, Plan plan, BillingPeriod period, Instant expiresAt) {
    }
}
