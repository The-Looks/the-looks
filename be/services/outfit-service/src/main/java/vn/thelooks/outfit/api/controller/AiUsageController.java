package vn.thelooks.outfit.api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.outfit.application.usecase.GetAiUsageQuery;

/** Chỉ ADMIN (packages/security chặn /api/admin/**): chi phí AI tháng này so với ngân sách. */
@RestController
@RequestMapping("/api/admin/outfits/ai-usage")
class AiUsageController {

    private final GetAiUsageQuery getAiUsage;

    AiUsageController(GetAiUsageQuery getAiUsage) {
        this.getAiUsage = getAiUsage;
    }

    @GetMapping
    GetAiUsageQuery.Report thisMonth() {
        return getAiUsage.thisMonth();
    }
}
