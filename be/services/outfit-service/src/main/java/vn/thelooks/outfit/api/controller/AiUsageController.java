package vn.thelooks.outfit.api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import vn.thelooks.outfit.application.usecase.GetAiUsageQuery;

@RestController
@RequestMapping("/api/admin/outfits/ai-usage")
class AiUsageController {

    private final GetAiUsageQuery getAiUsage;

    AiUsageController(GetAiUsageQuery getAiUsage) {
        this.getAiUsage = getAiUsage;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PERMISSION_AI_USAGE_READ')")
    GetAiUsageQuery.Report thisMonth() {
        return getAiUsage.thisMonth();
    }
}
