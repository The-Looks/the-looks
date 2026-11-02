package vn.thelooks.outfit.application.service;

import java.time.Clock;
import java.util.UUID;
import org.springframework.stereotype.Service;
import vn.thelooks.outfit.application.port.out.PreferencesRepository;
import vn.thelooks.outfit.application.usecase.StylePreferencesUseCase;
import vn.thelooks.outfit.domain.model.StylePreferences;

@Service
class StylePreferencesService implements StylePreferencesUseCase {

    private final PreferencesRepository repository;
    private final Clock clock;

    StylePreferencesService(PreferencesRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    @Override
    public StylePreferences preferences(UUID ownerId) {
        return repository.find(ownerId);
    }

    @Override
    public StylePreferences save(UUID ownerId, StylePreferences preferences) {
        repository.save(ownerId, preferences, clock.instant());
        return preferences;
    }
}
