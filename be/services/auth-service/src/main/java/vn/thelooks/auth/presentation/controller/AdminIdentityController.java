package vn.thelooks.auth.presentation.controller;

import java.util.List;
import java.util.UUID;
import java.util.function.Supplier;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.auth.application.port.in.GetAuditLogUseCase;
import vn.thelooks.auth.application.port.in.ManagePermissionUseCase;
import vn.thelooks.auth.application.port.in.ManageRoleUseCase;
import vn.thelooks.auth.application.port.in.ManageUserAccountUseCase;
import vn.thelooks.auth.application.port.in.RecordAdminFailureUseCase;
import vn.thelooks.auth.domain.model.AdminUserDetail;
import vn.thelooks.auth.domain.model.AuditLog;
import vn.thelooks.auth.domain.model.Permission;
import vn.thelooks.auth.domain.model.Role;
import vn.thelooks.security.CurrentUser;

@RestController
@RequestMapping("/api/admin/auth")
class AdminIdentityController {
    record Name(String name) {}
    record Description(String description) {}
    record RoleCreate(String code, String name) {}
    record PermissionCreate(String code, String description) {}
    record Status(String status) {}
    record PermissionSet(List<String> permissions) {}

    private final ManageRoleUseCase roles;
    private final ManagePermissionUseCase permissions;
    private final ManageUserAccountUseCase users;
    private final GetAuditLogUseCase audit;
    private final RecordAdminFailureUseCase failures;
    AdminIdentityController(ManageRoleUseCase roles, ManagePermissionUseCase permissions,
            ManageUserAccountUseCase users, GetAuditLogUseCase audit, RecordAdminFailureUseCase failures) {
        this.roles = roles;
        this.permissions = permissions;
        this.users = users;
        this.audit = audit;
        this.failures = failures;
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_USER_MANAGE')")
    AdminUserDetail user(@PathVariable UUID id) { return users.user(id); }

    @PutMapping("/users/{id}/status")
    @PreAuthorize("hasAuthority('PERMISSION_USER_MANAGE')")
    AdminUserDetail status(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id, @RequestBody Status body) {
        String action = body != null && "LOCKED".equals(body.status()) ? "USER_LOCK" : "USER_UNLOCK";
        return recorded(jwt, id.toString(), action, () -> users.setStatus(CurrentUser.id(jwt), id, body.status()));
    }

    @PutMapping("/users/{id}/roles/{role}")
    @PreAuthorize("hasAuthority('PERMISSION_ROLE_MANAGE')")
    AdminUserDetail grant(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id, @PathVariable String role) {
        return recorded(jwt, id.toString(), "USER_ROLE_GRANT", () -> users.setUserRole(CurrentUser.id(jwt), id, role, true));
    }

    @DeleteMapping("/users/{id}/roles/{role}")
    @PreAuthorize("hasAuthority('PERMISSION_ROLE_MANAGE')")
    AdminUserDetail revoke(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id, @PathVariable String role) {
        return recorded(jwt, id.toString(), "USER_ROLE_REVOKE", () -> users.setUserRole(CurrentUser.id(jwt), id, role, false));
    }

    @GetMapping("/roles")
    @PreAuthorize("hasAuthority('PERMISSION_ROLE_MANAGE')")
    List<Role> roles() { return roles.roles(); }

    @PostMapping("/roles")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('PERMISSION_ROLE_MANAGE')")
    Role createRole(@AuthenticationPrincipal Jwt jwt, @RequestBody RoleCreate body) {
        return recorded(jwt, body == null ? "" : body.code(), "ROLE_CREATE",
                () -> roles.createRole(CurrentUser.id(jwt), body.code(), body.name()));
    }

    @PutMapping("/roles/{code}")
    @PreAuthorize("hasAuthority('PERMISSION_ROLE_MANAGE')")
    Role updateRole(@AuthenticationPrincipal Jwt jwt, @PathVariable String code, @RequestBody Name body) {
        return recorded(jwt, code, "ROLE_UPDATE", () -> roles.updateRole(CurrentUser.id(jwt), code, body.name()));
    }

    @DeleteMapping("/roles/{code}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('PERMISSION_ROLE_MANAGE')")
    void deleteRole(@AuthenticationPrincipal Jwt jwt, @PathVariable String code) {
        recorded(jwt, code, "ROLE_DELETE", () -> { roles.deleteRole(CurrentUser.id(jwt), code); return null; });
    }

    @PutMapping("/roles/{code}/permissions")
    @PreAuthorize("hasAuthority('PERMISSION_ROLE_MANAGE')")
    Role permissions(@AuthenticationPrincipal Jwt jwt, @PathVariable String code,
            @RequestBody PermissionSet body) {
        return recorded(jwt, code, "ROLE_PERMISSIONS",
                () -> roles.setRolePermissions(CurrentUser.id(jwt), code, body.permissions()));
    }

    @GetMapping("/permissions")
    @PreAuthorize("hasAuthority('PERMISSION_ROLE_MANAGE')")
    List<Permission> permissions() { return permissions.permissions(); }

    @PostMapping("/permissions")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('PERMISSION_ROLE_MANAGE')")
    Permission createPermission(@AuthenticationPrincipal Jwt jwt, @RequestBody PermissionCreate body) {
        return recorded(jwt, body == null ? "" : body.code(), "PERMISSION_CREATE",
                () -> permissions.createPermission(CurrentUser.id(jwt), body.code(), body.description()));
    }

    @PutMapping("/permissions/{code}")
    @PreAuthorize("hasAuthority('PERMISSION_ROLE_MANAGE')")
    Permission updatePermission(@AuthenticationPrincipal Jwt jwt, @PathVariable String code,
            @RequestBody Description body) {
        return recorded(jwt, code, "PERMISSION_UPDATE",
                () -> permissions.updatePermission(CurrentUser.id(jwt), code, body.description()));
    }

    @DeleteMapping("/permissions/{code}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('PERMISSION_ROLE_MANAGE')")
    void deletePermission(@AuthenticationPrincipal Jwt jwt, @PathVariable String code) {
        recorded(jwt, code, "PERMISSION_DELETE",
                () -> { permissions.deletePermission(CurrentUser.id(jwt), code); return null; });
    }

    @GetMapping("/audit")
    @PreAuthorize("hasAuthority('PERMISSION_AUDIT_READ')")
    List<AuditLog> audit(@RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "ALL") String outcome,
            @RequestParam(defaultValue = "50") int limit) { return audit.audit(search, outcome, limit); }

    private <T> T recorded(Jwt jwt, String target, String action, Supplier<T> operation) {
        try {
            return operation.get();
        } catch (RuntimeException failure) {
            failures.record(CurrentUser.id(jwt), target, action, failure);
            throw failure;
        }
    }
}
