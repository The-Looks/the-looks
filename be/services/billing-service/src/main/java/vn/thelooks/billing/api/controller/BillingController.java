package vn.thelooks.billing.api.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.billing.api.dto.AutoRenewRequest;
import vn.thelooks.billing.api.dto.CheckoutRequest;
import vn.thelooks.billing.api.dto.EntitlementsResponse;
import vn.thelooks.billing.api.dto.OrderResponse;
import vn.thelooks.billing.application.port.out.PaymentGatewayException;
import vn.thelooks.billing.application.usecase.CheckoutUseCase;
import vn.thelooks.billing.application.usecase.ConfirmPaymentUseCase;
import vn.thelooks.billing.application.usecase.GetEntitlementsQuery;
import vn.thelooks.billing.application.usecase.SetAutoRenewUseCase;
import vn.thelooks.billing.domain.exception.InvalidPlanException;
import vn.thelooks.billing.domain.exception.OrderNotFoundException;
import vn.thelooks.security.CurrentUser;

@RestController
@RequestMapping("/api/app/billing")
class BillingController {

    private final GetEntitlementsQuery entitlements;
    private final CheckoutUseCase checkout;
    private final ConfirmPaymentUseCase confirm;
    private final SetAutoRenewUseCase autoRenew;

    BillingController(GetEntitlementsQuery entitlements, CheckoutUseCase checkout, ConfirmPaymentUseCase confirm,
            SetAutoRenewUseCase autoRenew) {
        this.entitlements = entitlements;
        this.checkout = checkout;
        this.confirm = confirm;
        this.autoRenew = autoRenew;
    }

    /** Gói và giới hạn hiện tại. Service khác (outfit, wardrobe) gọi endpoint này với JWT được chuyển tiếp. */
    @GetMapping("/me")
    EntitlementsResponse me(@AuthenticationPrincipal Jwt jwt) {
        return EntitlementsResponse.from(entitlements.entitlements(CurrentUser.id(jwt)));
    }

    /** Bật / tắt tự gia hạn gói đang dùng. */
    @PutMapping("/me/auto-renew")
    EntitlementsResponse autoRenew(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody AutoRenewRequest request) {
        return EntitlementsResponse.from(autoRenew.setAutoRenew(CurrentUser.id(jwt), request.enabled()));
    }

    /** Tạo đơn và mã VietQR (checkoutUrl là URL ảnh QR). */
    @PostMapping("/checkout")
    @ResponseStatus(HttpStatus.CREATED)
    OrderResponse checkout(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CheckoutRequest request) {
        return OrderResponse.from(checkout.checkout(CurrentUser.id(jwt), request.plan(), request.period()));
    }

    /** Trang thanh toán hỏi định kỳ xem đơn đã nhận tiền chưa. */
    @PostMapping("/orders/{orderCode}/confirm")
    OrderResponse confirm(@AuthenticationPrincipal Jwt jwt, @PathVariable long orderCode) {
        return OrderResponse.from(confirm.confirm(CurrentUser.id(jwt), orderCode));
    }

    @ExceptionHandler(InvalidPlanException.class)
    ProblemDetail badRequest(InvalidPlanException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    @ExceptionHandler(OrderNotFoundException.class)
    ProblemDetail notFound(OrderNotFoundException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(PaymentGatewayException.class)
    ProblemDetail gatewayDown(PaymentGatewayException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE, "Cổng thanh toán tạm thời không khả dụng, thử lại sau ít phút");
    }
}
