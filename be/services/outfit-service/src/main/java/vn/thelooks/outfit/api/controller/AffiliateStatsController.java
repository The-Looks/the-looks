package vn.thelooks.outfit.api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.outfit.application.port.out.AffiliateStatsQuery;

/** Chỉ ADMIN (packages/security chặn /api/admin/**): lượt bấm "Gợi ý mua thêm". */
@RestController
@RequestMapping("/api/admin/outfits/affiliate-stats")
class AffiliateStatsController {

    private final AffiliateStatsQuery stats;

    AffiliateStatsController(AffiliateStatsQuery stats) {
        this.stats = stats;
    }

    @GetMapping
    AffiliateStatsQuery.AffiliateStats stats(@RequestParam(defaultValue = "30") int days) {
        return stats.stats(Math.max(1, Math.min(90, days)));
    }
}
