package vn.thelooks.billing.application.service;

import java.time.Clock;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import vn.thelooks.billing.application.port.out.OrderRepository;
import vn.thelooks.billing.application.port.out.PaymentGateway;
import vn.thelooks.billing.application.port.out.SubscriptionRepository;
import vn.thelooks.billing.application.usecase.CheckoutUseCase;
import vn.thelooks.billing.application.usecase.ConfirmPaymentUseCase;
import vn.thelooks.billing.application.usecase.GetEntitlementsQuery;
import vn.thelooks.billing.application.usecase.RefundOrderUseCase;
import vn.thelooks.billing.application.usecase.SetAutoRenewUseCase;
import vn.thelooks.billing.domain.exception.InvalidPlanException;
import vn.thelooks.billing.domain.exception.OrderNotFoundException;
import vn.thelooks.billing.domain.exception.OrderNotRefundableException;
import vn.thelooks.billing.domain.model.BillingPeriod;
import vn.thelooks.billing.domain.model.Entitlements;
import vn.thelooks.billing.domain.model.Order;
import vn.thelooks.billing.domain.model.OrderStatus;
import vn.thelooks.billing.domain.model.Plan;
import vn.thelooks.billing.domain.model.Subscription;
import vn.thelooks.billing.domain.service.SubscriptionCalculator;

@Service
class BillingService implements GetEntitlementsQuery, CheckoutUseCase, ConfirmPaymentUseCase, SetAutoRenewUseCase,
        RefundOrderUseCase {

    private static final Logger log = LoggerFactory.getLogger(BillingService.class);

    private final OrderRepository orders;
    private final SubscriptionRepository subscriptions;
    private final PaymentGateway gateway;
    private final Clock clock;
    private final TransactionTemplate tx;

    BillingService(OrderRepository orders, SubscriptionRepository subscriptions, PaymentGateway gateway, Clock clock,
            PlatformTransactionManager transactions) {
        this.orders = orders;
        this.subscriptions = subscriptions;
        this.gateway = gateway;
        this.clock = clock;
        this.tx = new TransactionTemplate(transactions);
    }

    @Override
    @Transactional(readOnly = true)
    public Entitlements entitlements(UUID ownerId) {
        return Entitlements.of(subscriptions.find(ownerId).orElse(null), clock.instant());
    }

    @Override
    public Entitlements setAutoRenew(UUID ownerId, boolean enabled) {
        return tx.execute(status -> {
            Instant now = clock.instant();
            Subscription current = subscriptions.findForUpdate(ownerId)
                    .filter(s -> s.activeAt(now))
                    .orElseThrow(() -> new InvalidPlanException("Bạn đang dùng gói Free, không có gì để gia hạn"));
            Subscription updated = current.withAutoRenew(enabled);
            subscriptions.save(updated);
            return Entitlements.of(updated, now);
        });
    }

    /** Không bọc transaction: gọi cổng thanh toán qua mạng, không giữ kết nối DB. */
    @Override
    public Order checkout(UUID ownerId, Plan plan, BillingPeriod period) {
        if (plan == null || !plan.paid() || period == null) {
            throw new InvalidPlanException("Chọn gói Plus hoặc Pro và kỳ tháng hoặc năm");
        }
        Order order = orders.create(new Order(null, ownerId, plan, period, plan.priceVnd(period), OrderStatus.PENDING,
                null, clock.instant(), null));
        String url = gateway.createCheckoutUrl(order);
        orders.setCheckoutUrl(order.orderCode(), url);
        return withUrl(order, url);
    }

    @Override
    public Order confirm(UUID ownerId, long orderCode) {
        Order order = orders.find(orderCode)
                .filter(o -> ownerId.equals(o.ownerId()))
                .orElseThrow(() -> new OrderNotFoundException("Không tìm thấy đơn " + orderCode));
        if (order.status() == OrderStatus.PENDING && gateway.isPaid(orderCode, order.amountVnd())) {
            activate(orderCode);
        }
        return orders.find(orderCode).orElseThrow();
    }

    @Override
    public boolean handleWebhook(Map<String, Object> body) {
        var notice = gateway.verifyWebhook(body);
        if (notice.isEmpty()) {
            return false;
        }
        var order = orders.find(notice.get().orderCode());
        if (order.isEmpty()) {
            log.info("Webhook cho đơn không tồn tại {} (có thể là webhook thử của PayOS)", notice.get().orderCode());
            return true;
        }
        if (notice.get().amountVnd() < order.get().amountVnd()) {
            log.warn("Đơn {} trả thiếu: {} < {}", order.get().orderCode(), notice.get().amountVnd(), order.get().amountVnd());
            return true;
        }
        activate(order.get().orderCode());
        return true;
    }

    /**
     * Đơn PENDING → PAID và cộng thời hạn gói, trong một transaction. Webhook và người dùng quay lại
     * có thể tới cùng lúc: markPaid chỉ thành công một lần nên gói không bị cộng hai lần.
     * Dùng TransactionTemplate vì @Transactional không có tác dụng khi gọi hàm trong cùng class.
     */
    /** Một transaction: đổi trạng thái đơn và trừ hạn gói cùng lúc, khoá dòng gói như khi kích hoạt. */
    @Override
    public RefundResult refund(long orderCode, String reason, UUID adminId) {
        return tx.execute(status -> {
            Order order = orders.find(orderCode).orElseThrow(() -> new OrderNotFoundException("Không tìm thấy đơn " + orderCode));
            Instant now = clock.instant();
            if (!orders.markRefunded(orderCode, now, reason, adminId)) {
                throw new OrderNotRefundableException("Chỉ hoàn tiền được đơn đã thanh toán (đơn " + orderCode + " đang "
                        + order.status() + ")");
            }
            Subscription current = subscriptions.findForUpdate(order.ownerId()).orElse(null);
            Instant newExpiry = SubscriptionCalculator.expiryAfterRefund(current, order.plan(), order.period(), now).orElse(null);
            if (newExpiry != null) {
                // Hoàn hết thời gian thì tắt tự gia hạn để không còn ân hạn 3 ngày
                subscriptions.save(new Subscription(current.ownerId(), current.plan(), current.period(), newExpiry,
                        current.autoRenew() && newExpiry.isAfter(now)));
            } else {
                log.warn("Đơn {} hoàn tiền nhưng gói hiện tại khác gói của đơn: admin cần chỉnh gói tay", orderCode);
            }
            log.info("Admin {} hoàn tiền đơn {} ({}đ): {}", adminId, orderCode, order.amountVnd(), reason);
            return new RefundResult(orders.find(orderCode).orElseThrow(), newExpiry);
        });
    }

    void activate(long orderCode) {
        tx.executeWithoutResult(status -> {
            Instant now = clock.instant();
            if (!orders.markPaid(orderCode, now)) {
                return;
            }
            Order order = orders.find(orderCode).orElseThrow();
            Subscription current = subscriptions.findForUpdate(order.ownerId()).orElse(null);
            Instant expiry = SubscriptionCalculator.newExpiry(current, order.plan(), order.period(), now);
            // Trả tiền (mua mới hoặc gia hạn) thì bật lại tự gia hạn và nhớ kỳ để lần sau gia hạn đúng kỳ
            subscriptions.save(new Subscription(order.ownerId(), order.plan(), order.period(), expiry, true));
            log.info("Kích hoạt gói {} cho {} tới {} (đơn {})", order.plan(), order.ownerId(), expiry, orderCode);
        });
    }

    private static Order withUrl(Order o, String url) {
        return new Order(o.orderCode(), o.ownerId(), o.plan(), o.period(), o.amountVnd(), o.status(), url, o.createdAt(), o.paidAt());
    }
}
