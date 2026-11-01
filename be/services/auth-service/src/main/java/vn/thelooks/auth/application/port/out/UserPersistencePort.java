package vn.thelooks.auth.application.port.out;

import java.util.Optional;
import java.util.UUID;
import vn.thelooks.auth.domain.model.User;

public interface UserPersistencePort {

    User save(User user);

    Optional<User> findById(UUID id);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
