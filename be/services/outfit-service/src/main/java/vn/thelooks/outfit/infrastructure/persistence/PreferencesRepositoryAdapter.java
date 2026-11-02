package vn.thelooks.outfit.infrastructure.persistence;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Arrays;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
import vn.thelooks.outfit.application.port.out.PreferencesRepository;
import vn.thelooks.outfit.domain.model.StylePreferences;
import vn.thelooks.outfit.domain.model.StylePreferences.Budget;
import vn.thelooks.outfit.domain.model.StylePreferences.Gender;

@Component
class PreferencesRepositoryAdapter implements PreferencesRepository {

    private final JdbcClient jdbc;

    PreferencesRepositoryAdapter(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public StylePreferences find(UUID ownerId) {
        return jdbc.sql("select gender, styles, budget from outfit_preferences where owner_id = :owner")
                .param("owner", ownerId)
                .query((rs, n) -> new StylePreferences(
                        rs.getString("gender") == null ? null : Gender.valueOf(rs.getString("gender")),
                        Arrays.stream(rs.getString("styles").split(",")).filter(s -> !s.isBlank()).collect(Collectors.toSet()),
                        rs.getString("budget") == null ? null : Budget.valueOf(rs.getString("budget"))))
                .optional()
                .orElse(StylePreferences.NONE);
    }

    @Override
    public void save(UUID ownerId, StylePreferences p, Instant at) {
        jdbc.sql("""
                insert into outfit_preferences (owner_id, gender, styles, budget, updated_at)
                values (:owner, :gender, :styles, :budget, :at)
                on conflict (owner_id) do update set gender = excluded.gender, styles = excluded.styles,
                    budget = excluded.budget, updated_at = excluded.updated_at
                """)
                .param("owner", ownerId)
                .param("gender", p.gender() == null ? null : p.gender().name())
                .param("styles", p.styles().stream().sorted().collect(Collectors.joining(",")))
                .param("budget", p.budget() == null ? null : p.budget().name())
                .param("at", Timestamp.from(at))
                .update();
    }
}
