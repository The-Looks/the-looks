package vn.thelooks.billing.api.controller;

import java.util.List;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.billing.api.dto.PlanResponse;
import vn.thelooks.billing.application.usecase.ConfirmPaymentUseCase;

/** Không cần đăng nhập: bảng giá và webhook của cổng thanh toán (xác thực bằng API key). */
@RestController
@RequestMapping("/api/public/billing")
class PublicBillingController {

    private final ConfirmPaymentUseCase confirm;

    PublicBillingController(ConfirmPaymentUseCase confirm) {
        this.confirm = confirm;
    }

    @GetMapping("/plans")
    List<PlanResponse> plans() {
        return PlanResponse.all();
    }

    /**
     * Khai báo trong SePay (kiểu xác thực API Key): https://<domain>/api/public/billing/sepay/webhook.
     * SePay coi là đã nhận khi trả 200 kèm {"success": true}; không thì gửi lại.
     */
    @PostMapping("/sepay/webhook")
    ResponseEntity<Map<String, Object>> sepayWebhook(@RequestBody Map<String, Object> body,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        return confirm.handleWebhook(body, authorization)
                ? ResponseEntity.ok(Map.of("success", true))
                : ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false));
    }
}
