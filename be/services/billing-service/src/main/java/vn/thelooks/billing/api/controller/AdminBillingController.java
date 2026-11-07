package vn.thelooks.billing.api.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.billing.api.dto.OrderResponse;
import vn.thelooks.billing.application.port.out.AdminOrderQuery;
import vn.thelooks.billing.application.port.out.BillingStatsQuery;
import vn.thelooks.billing.application.usecase.RefundOrderUseCase;
import vn.thelooks.billing.domain.exception.OrderNotFoundException;
import vn.thelooks.billing.domain.exception.OrderNotRefundableException;
import vn.thelooks.billing.domain.model.OrderStatus;
import vn.thelooks.security.CurrentUser;

@RestController
@RequestMapping("/api/admin/billing/stats")
class AdminBillingController {

    private final BillingStatsQuery stats;
    private final AdminOrderQuery orders;
    private final RefundOrderUseCase refunds;

    AdminBillingController(BillingStatsQuery stats) {
        this.stats = stats;
        this.orders = orders;
        this.refunds = refunds;
        // Chỉ báo có / không có key, không bao giờ trả giá trị key
        this.status = new Status(gateway, !clientId.isBlank() && !apiKey.isBlank() && !checksumKey.isBlank());
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PERMISSION_BILLING_STATS_READ')")
    BillingStatsQuery.BillingStats stats(@RequestParam(defaultValue = "30") int days) {
        return stats.stats(Math.max(1, Math.min(90, days)));
    }

    /** Đơn mới nhất trước; lọc theo trạng thái, người dùng (id), mã đơn. */
    @GetMapping("/orders")
    AdminOrderQuery.OrderPage orders(@RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) UUID ownerId, @RequestParam(required = false) Long orderCode,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return orders.list(status, ownerId, orderCode, Math.max(0, page), Math.max(1, Math.min(100, size)));
    }

    record RefundRequest(@NotBlank @Size(max = 300) String reason) {}

    record RefundResponse(OrderResponse order, Instant newExpiry) {}

    /** Ghi nhận đã hoàn tiền (tiền chuyển trả bằng tay) và trừ lại thời gian gói của đơn. */
    @PostMapping("/orders/{orderCode}/refund")
    RefundResponse refund(@AuthenticationPrincipal Jwt jwt, @PathVariable long orderCode, @Valid @RequestBody RefundRequest body) {
        var result = refunds.refund(orderCode, body.reason().trim(), CurrentUser.id(jwt));
        return new RefundResponse(OrderResponse.from(result.order()), result.newExpiry());
    }

    @ExceptionHandler(OrderNotFoundException.class)
    ProblemDetail notFound(OrderNotFoundException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(OrderNotRefundableException.class)
    ProblemDetail conflict(OrderNotRefundableException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, e.getMessage());
    }
}
