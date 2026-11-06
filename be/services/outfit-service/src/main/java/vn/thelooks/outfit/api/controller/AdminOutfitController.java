package vn.thelooks.outfit.api.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Clock;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.outfit.application.port.out.AffiliateBlocklist;
import vn.thelooks.security.CurrentUser;

/** Chỉ ADMIN (packages/security chặn /api/admin/**): chặn sản phẩm affiliate, xem cấu hình dịch vụ ngoài. */
@RestController
@RequestMapping("/api/admin/outfits")
class AdminOutfitController {

    private final AffiliateBlocklist blocklist;
    private final Clock clock;
    private final Status status;

    AdminOutfitController(AffiliateBlocklist blocklist, Clock clock,
            @Value("${thelooks.ai.provider}") String aiProvider,
            @Value("${GEMINI_API_KEY:}") String geminiKey,
            @Value("${ANTHROPIC_API_KEY:}") String anthropicKey,
            @Value("${thelooks.affiliate.accesstrade-api-key:}") String accessTradeKey,
            @Value("${thelooks.ai.monthly-budget-usd}") double aiBudgetUsd) {
        this.blocklist = blocklist;
        this.clock = clock;
        // Chỉ báo có / không có key, không bao giờ trả giá trị key
        this.status = new Status(aiProvider, !geminiKey.isBlank(), !anthropicKey.isBlank(), !accessTradeKey.isBlank(), aiBudgetUsd);
    }

    record Status(String aiProvider, boolean geminiConfigured, boolean anthropicConfigured, boolean accessTradeConfigured,
            double aiBudgetUsd) {}

    @GetMapping("/status")
    Status status() {
        return status;
    }

    @GetMapping("/affiliate-blocks")
    List<AffiliateBlocklist.Blocked> blocks() {
        return blocklist.list();
    }

    record BlockRequest(@NotBlank @Size(max = 30) String source, @NotBlank @Size(max = 64) String productId,
            @Size(max = 300) String title) {}

    @PostMapping("/affiliate-blocks")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void block(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody BlockRequest body) {
        blocklist.block(body.source(), body.productId(), body.title() == null ? "" : body.title(), CurrentUser.id(jwt),
                clock.instant());
    }

    @DeleteMapping("/affiliate-blocks")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void unblock(@RequestParam String source, @RequestParam String productId) {
        blocklist.unblock(source, productId);
    }
}
