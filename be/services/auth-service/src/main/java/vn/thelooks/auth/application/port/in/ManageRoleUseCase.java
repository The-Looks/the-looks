package vn.thelooks.auth.application.port.in;

import java.util.List;
import java.util.UUID;
import vn.thelooks.auth.domain.model.Role;

public interface ManageRoleUseCase {
    List<Role> roles();
    Role createRole(UUID actor, String code, String name);
    Role updateRole(UUID actor, String code, String name);
    void deleteRole(UUID actor, String code);
    Role setRolePermissions(UUID actor, String code, List<String> permissions);
}
