package vn.thelooks.outfit.application.port.out;

import java.time.Instant;
import java.util.UUID;
import vn.thelooks.outfit.domain.model.ProductOffer;

public interface AffiliateClickRepository {

    void record(UUID ownerId, ProductOffer offer, String subId, Instant at);
}
