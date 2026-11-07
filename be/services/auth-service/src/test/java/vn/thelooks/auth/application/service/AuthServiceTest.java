package vn.thelooks.auth.application.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.thelooks.auth.application.port.in.RegisterUseCase;
import vn.thelooks.auth.application.port.out.ConsentStore;
import vn.thelooks.auth.application.port.out.PasswordHasher;
import vn.thelooks.auth.application.port.out.RefreshTokenSessionStore;
import vn.thelooks.auth.application.port.out.TokenIssuer;
import vn.thelooks.auth.application.port.out.UserPersistencePort;
import vn.thelooks.auth.domain.enums.UserStatus;
import vn.thelooks.auth.domain.exception.InvalidCredentialsException;
import vn.thelooks.auth.domain.exception.UserAlreadyExistsException;
import vn.thelooks.auth.domain.model.User;

class AuthServiceTest {
    private static final Instant NOW = Instant.parse("2026-11-07T00:00:00Z");
    private final UserPersistencePort users = mock(UserPersistencePort.class);
    private final PasswordHasher passwords = mock(PasswordHasher.class);
    private final RefreshTokenSessionStore sessions = mock(RefreshTokenSessionStore.class);
    private final TokenIssuer tokens = mock(TokenIssuer.class);
    private final ConsentStore consents = mock(ConsentStore.class);
    private final AuthService service = new AuthService(users, passwords, sessions, tokens, consents,
            Clock.fixed(NOW, ZoneOffset.UTC));

    @Test
    void registrationRejectsDuplicateEmailBeforeCreatingAccount() {
        when(users.existsByEmail("person@example.com")).thenReturn(true);
        assertThrows(UserAlreadyExistsException.class, () -> service.register(
                new RegisterUseCase.RegisterCommand(" Person@Example.com ", "strong-password", "Person")));
        verify(users, never()).save(any());
    }

    @Test
    void wrongPasswordNeverCreatesSession() {
        User user = new User(UUID.randomUUID(), "person@example.com", "stored-hash", "Person", true,
                Set.of("USER"), Set.of(), UserStatus.ACTIVE, NOW, NOW);
        when(users.findByEmail("person@example.com")).thenReturn(Optional.of(user));
        when(passwords.matches("wrong-password", "stored-hash")).thenReturn(false);
        assertThrows(InvalidCredentialsException.class, () -> service.login("person@example.com", "wrong-password"));
        verify(sessions, never()).create(any(), any(), any());
    }

    @Test
    void reusedRefreshTokenNeverIssuesAnotherAccessToken() {
        when(sessions.rotate("used-token", NOW)).thenReturn(RefreshTokenSessionStore.Rotation.reused());
        assertThrows(InvalidCredentialsException.class, () -> service.refresh("used-token"));
        verify(tokens, never()).issue(any(), any());
    }
}
