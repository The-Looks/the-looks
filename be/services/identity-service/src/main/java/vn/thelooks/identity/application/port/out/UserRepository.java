package vn.thelooks.identity.application.port.out;

import java.util.Optional;
import java.util.UUID;
import vn.thelooks.identity.domain.model.User;

public interface UserRepository {

    User save(User user);

    Optional<User> findById(UUID id);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
