package vn.thelooks.auth.application.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import vn.thelooks.auth.application.port.out.PasswordHasher;
import vn.thelooks.auth.application.port.out.PasswordSetupRepositoryPort;

class PasswordSetupServiceTest {
    private final PasswordSetupRepositoryPort store = org.mockito.Mockito.mock(PasswordSetupRepositoryPort.class);
    private final PasswordHasher hasher = org.mockito.Mockito.mock(PasswordHasher.class);
    private final Instant now = Instant.parse("2026-11-06T10:00:00Z");
    private final PasswordSetupService service = new PasswordSetupService(store,hasher,Clock.fixed(now,ZoneOffset.UTC));
    private final UUID user = UUID.randomUUID();
    private final UUID session = UUID.randomUUID();

    @Test
    void requiresRecentGoogleSessionBeforeSettingPassword() {
        var failure = assertThrows(ResponseStatusException.class, () -> service.setup(user,session,"long-password"));
        assertEquals(HttpStatus.FORBIDDEN,failure.getStatusCode());
        verify(hasher,never()).hash(any());
        verify(store).isRecentGoogleSession(user,session,now.minusSeconds(600));
    }

    @Test
    void setsPasswordOnceForGoogleAccount() {
        when(store.isRecentGoogleSession(eq(user),eq(session),any())).thenReturn(true);
        when(hasher.hash("long-password")).thenReturn("argon2-hash");
        when(store.setIfAbsent(user,"argon2-hash")).thenReturn(true);
        service.setup(user,session,"long-password");
        verify(store).setIfAbsent(user,"argon2-hash");

        when(store.setIfAbsent(user,"argon2-hash")).thenReturn(false);
        var failure = assertThrows(ResponseStatusException.class, () -> service.setup(user,session,"long-password"));
        assertEquals(HttpStatus.CONFLICT,failure.getStatusCode());
    }
}
