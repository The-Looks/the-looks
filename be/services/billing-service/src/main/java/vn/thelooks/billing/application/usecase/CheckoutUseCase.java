package vn.thelooks.billing.application.usecase;

import java.util.UUID;
import vn.thelooks.billing.domain.model.BillingPeriod;
import vn.thelooks.billing.domain.model.Order;
import vn.thelooks.billing.domain.model.Plan;

/** Mua hoặc gia hạn gói: tạo đơn + link thanh toán. */
public interface CheckoutUseCase {

    Order checkout(UUID ownerId, Plan plan, BillingPeriod period);
}
