package vn.thelooks.auth.presentation.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import vn.thelooks.auth.application.port.out.AdminUserQueryPort;

@RestController
@RequestMapping("/api/admin/auth/users")
class AdminUsersController {
    private final AdminUserQueryPort users;

    AdminUsersController(AdminUserQueryPort users) { this.users = users; }

    @GetMapping
    @PreAuthorize("hasAuthority('PERMISSION_USER_MANAGE')")
    AdminUserQueryPort.PageResult list(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "") String search) {
        return users.list(page, size, search);
    }
}
