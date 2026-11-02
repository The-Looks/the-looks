package vn.thelooks.outfit.application.port.out;

import java.time.Instant;
import java.util.UUID;
import vn.thelooks.outfit.domain.model.StylePreferences;

public interface PreferencesRepository {

    /** {@link StylePreferences#NONE} khi người dùng chưa khai. */
    StylePreferences find(UUID ownerId);

    void save(UUID ownerId, StylePreferences preferences, Instant at);
}
