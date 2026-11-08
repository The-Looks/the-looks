package vn.thelooks.outfit.infrastructure.persistence;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Arrays;
import java.util.Set;
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
        return jdbc.sql("select gender, styles, budget, colors from outfit_preferences where owner_id = :owner")
                .param("owner", ownerId)
                .query((rs, n) -> new StylePreferences(
                        rs.getString("gender") == null ? null : Gender.valueOf(rs.getString("gender")),
                        split(rs.getString("styles")),
                        rs.getString("budget") == null ? null : Budget.valueOf(rs.getString("budget")),
                        split(rs.getString("colors"))))
                .optional()
                .orElse(StylePreferences.NONE);
    }

    private static Set<String> split(String csv) {
        return Arrays.stream(csv.split(",")).filter(s -> !s.isBlank()).collect(Collectors.toSet());
    }

    @Override
    public void save(UUID ownerId, StylePreferences p, Instant at) {
        jdbc.sql("""
                insert into outfit_preferences (owner_id, gender, styles, budget, colors, updated_at)
                values (:owner, :gender, :styles, :budget, :colors, :at)
                on conflict (owner_id) do update set gender = excluded.gender, styles = excluded.styles,
                    budget = excluded.budget, colors = excluded.colors, updated_at = excluded.updated_at
                """)
                .param("owner", ownerId)
                .param("gender", p.gender() == null ? null : p.gender().name())
                .param("styles", p.styles().stream().sorted().collect(Collectors.joining(",")))
                .param("budget", p.budget() == null ? null : p.budget().name())
                .param("colors", p.colors().stream().sorted().collect(Collectors.joining(",")))
                .param("at", Timestamp.from(at))
                .update();
    }
}
