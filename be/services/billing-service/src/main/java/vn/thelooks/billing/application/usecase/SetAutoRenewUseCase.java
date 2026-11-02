package vn.thelooks.billing.application.usecase;

import java.util.UUID;
import vn.thelooks.billing.domain.model.Entitlements;

public interface SetAutoRenewUseCase {

    /** Bật / tắt tự gia hạn gói đang dùng. Gói Free thì báo lỗi InvalidPlanException. */
    Entitlements setAutoRenew(UUID ownerId, boolean enabled);
}
