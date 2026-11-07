package vn.thelooks.auth.presentation.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import vn.thelooks.auth.application.port.out.AdminStatsQueryPort;

/** /api/admin/** chỉ cho tài khoản có quyền ADMIN (cấu hình chung trong packages/security). */
@RestController
@RequestMapping("/api/admin/auth/stats")
class AdminStatsController {
    private final AdminStatsQueryPort stats;

    AdminStatsController(AdminStatsQueryPort stats) { this.stats = stats; }

    @GetMapping
    @PreAuthorize("hasAuthority('PERMISSION_USER_MANAGE')")
    AdminStatsQueryPort.UserStats stats(@RequestParam(defaultValue = "30") int days) {
        return stats.userStats(Math.max(1, Math.min(90, days)));
    }
}
