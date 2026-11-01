package vn.thelooks.auth.application.port.out;

import java.util.Optional;
import java.util.UUID;

public interface GoogleIdentityStore {

    Optional<UUID> findUserId(String subject);

    void link(String subject, UUID userId);
}
