package vn.thelooks.auth.application.port.in;

import java.util.List;
import java.util.UUID;
import vn.thelooks.auth.domain.model.Permission;

public interface ManagePermissionUseCase {
    List<Permission> permissions();
    Permission createPermission(UUID actor, String code, String description);
    Permission updatePermission(UUID actor, String code, String description);
    void deletePermission(UUID actor, String code);
}
