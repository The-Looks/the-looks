package vn.thelooks.identity.application.port.out;

import java.util.UUID;

public interface AdminBootstrapStore {

    boolean promoteFirstVerifiedAdmin(UUID userId, String email);
}
