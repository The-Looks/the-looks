package vn.thelooks.billing.api.controller;

import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.billing.api.dto.PlanResponse;
import vn.thelooks.billing.application.usecase.ConfirmPaymentUseCase;

/** Không cần đăng nhập: bảng giá và webhook của cổng thanh toán (xác thực bằng chữ ký). */
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

    /** Khai báo URL này trong trang quản lý PayOS: https://<domain>/api/public/billing/payos/webhook */
    @PostMapping("/payos/webhook")
    ResponseEntity<Map<String, Object>> payosWebhook(@RequestBody Map<String, Object> body) {
        return confirm.handleWebhook(body)
                ? ResponseEntity.ok(Map.of("success", true))
                : ResponseEntity.badRequest().body(Map.of("success", false));
    }
}
