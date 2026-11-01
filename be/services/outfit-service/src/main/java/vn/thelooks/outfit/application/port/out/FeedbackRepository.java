package vn.thelooks.outfit.application.port.out;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import vn.thelooks.outfit.domain.model.Feedback;

public interface FeedbackRepository {

    /** Ghi hoặc ghi đè phản hồi cho một tổ hợp. */
    void save(UUID ownerId, String comboKey, Feedback feedback, Instant at);

    /** comboKey → phản hồi gần nhất của người dùng. */
    Map<String, Feedback> byOwner(UUID ownerId);
}
