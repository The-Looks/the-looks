package vn.thelooks.auth.application.port.out;

import java.util.UUID;

public interface FirstAdminRoleAssigner {

    boolean promoteFirstVerifiedAdmin(UUID userId, String email);
}
