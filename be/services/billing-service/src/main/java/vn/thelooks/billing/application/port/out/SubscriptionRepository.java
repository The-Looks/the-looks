package vn.thelooks.billing.application.port.out;

import java.util.Optional;
import java.util.UUID;
import vn.thelooks.billing.domain.model.Subscription;

public interface SubscriptionRepository {

    /** Khoá dòng của người dùng tới hết transaction, để hai đơn trả cùng lúc không cộng sai ngày. */
    Optional<Subscription> findForUpdate(UUID ownerId);

    Optional<Subscription> find(UUID ownerId);

    void save(Subscription subscription);
}
