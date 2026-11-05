package vn.thelooks.billing.api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.billing.application.port.out.BillingStatsQuery;

/** Chỉ ADMIN (quy tắc chung cho /api/admin/** trong packages/security). */
@RestController
@RequestMapping("/api/admin/billing/stats")
class AdminBillingController {

    private final BillingStatsQuery stats;

    AdminBillingController(BillingStatsQuery stats) {
        this.stats = stats;
    }

    @GetMapping
    BillingStatsQuery.BillingStats stats(@RequestParam(defaultValue = "30") int days) {
        return stats.stats(Math.max(1, Math.min(90, days)));
    }
}
