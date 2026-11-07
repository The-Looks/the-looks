package vn.thelooks.auth.application.port.out;

import java.util.List;
import java.util.UUID;
import vn.thelooks.auth.domain.model.AdminUserDetail;
import vn.thelooks.auth.domain.model.AuditLog;
import vn.thelooks.auth.domain.model.Permission;
import vn.thelooks.auth.domain.model.Role;

public interface AdminIdentityRepositoryPort {
    List<Role> roles();
    Role createRole(UUID actor, String code, String name);
    Role updateRole(UUID actor, String code, String name);
    void deleteRole(UUID actor, String code);
    Role setRolePermissions(UUID actor, String code, List<String> permissions);
    List<Permission> permissions();
    Permission createPermission(UUID actor, String code, String description);
    Permission updatePermission(UUID actor, String code, String description);
    void deletePermission(UUID actor, String code);
    AdminUserDetail user(UUID id);
    AdminUserDetail setStatus(UUID actor, UUID target, String status);
    AdminUserDetail setUserRole(UUID actor, UUID target, String role, boolean grant);
    List<AuditLog> audit(String search, String outcome, int limit);
}
