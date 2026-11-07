package vn.thelooks.auth.application.port.in;

import java.util.UUID;
import vn.thelooks.auth.domain.model.AdminUserDetail;

public interface ManageUserAccountUseCase {
    AdminUserDetail user(UUID id);
    AdminUserDetail setStatus(UUID actor, UUID target, String status);
    AdminUserDetail setUserRole(UUID actor, UUID target, String role, boolean grant);
}
