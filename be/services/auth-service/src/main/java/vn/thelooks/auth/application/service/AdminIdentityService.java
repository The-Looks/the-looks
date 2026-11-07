package vn.thelooks.auth.application.service;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import vn.thelooks.auth.application.port.in.GetAuditLogUseCase;
import vn.thelooks.auth.application.port.in.ManagePermissionUseCase;
import vn.thelooks.auth.application.port.in.ManageRoleUseCase;
import vn.thelooks.auth.application.port.in.ManageUserAccountUseCase;
import vn.thelooks.auth.application.port.out.AdminIdentityRepositoryPort;
import vn.thelooks.auth.domain.model.AdminUserDetail;
import vn.thelooks.auth.domain.model.AuditLog;
import vn.thelooks.auth.domain.model.Permission;
import vn.thelooks.auth.domain.model.Role;

@Service
class AdminIdentityService implements ManageRoleUseCase, ManagePermissionUseCase,
        ManageUserAccountUseCase, GetAuditLogUseCase {
    private final AdminIdentityRepositoryPort repository;
    AdminIdentityService(AdminIdentityRepositoryPort repository) { this.repository = repository; }
    public List<Role> roles() { return repository.roles(); }
    public Role createRole(UUID actor, String code, String name) { return repository.createRole(actor, code, name); }
    public Role updateRole(UUID actor, String code, String name) { return repository.updateRole(actor, code, name); }
    public void deleteRole(UUID actor, String code) { repository.deleteRole(actor, code); }
    public Role setRolePermissions(UUID actor, String code, List<String> permissions) {
        return repository.setRolePermissions(actor, code, permissions);
    }
    public List<Permission> permissions() { return repository.permissions(); }
    public Permission createPermission(UUID actor, String code, String description) {
        return repository.createPermission(actor, code, description);
    }
    public Permission updatePermission(UUID actor, String code, String description) {
        return repository.updatePermission(actor, code, description);
    }
    public void deletePermission(UUID actor, String code) { repository.deletePermission(actor, code); }
    public AdminUserDetail user(UUID id) { return repository.user(id); }
    public AdminUserDetail setStatus(UUID actor, UUID target, String status) {
        return repository.setStatus(actor, target, status);
    }
    public AdminUserDetail setUserRole(UUID actor, UUID target, String role, boolean grant) {
        return repository.setUserRole(actor, target, role, grant);
    }
    public List<AuditLog> audit(String search, String outcome, int limit) { return repository.audit(search, outcome, limit); }
}
