package vn.thelooks.auth.application.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import vn.thelooks.auth.application.port.out.AdminBootstrapStore;
import vn.thelooks.auth.application.port.out.GoogleFlowStore;
import vn.thelooks.auth.application.port.out.GoogleIdentityStore;
import vn.thelooks.auth.application.port.out.GoogleTokenVerifier;
import vn.thelooks.auth.application.port.out.RefreshSessionStore;
import vn.thelooks.auth.application.port.out.TokenIssuer;
import vn.thelooks.auth.application.port.out.UserRepository;
import vn.thelooks.auth.domain.exception.InvalidCredentialsException;
import vn.thelooks.auth.domain.enums.Role;
import vn.thelooks.auth.domain.model.User;
import vn.thelooks.auth.domain.enums.UserStatus;

class GoogleOidcServiceTest {

    private static final Instant NOW = Instant.parse("2026-11-01T00:00:00Z");
    private final GoogleFlowStore flows = mock(GoogleFlowStore.class);
    private final GoogleIdentityStore identities = mock(GoogleIdentityStore.class);
    private final GoogleTokenVerifier verifier = mock(GoogleTokenVerifier.class);
    private final UserRepository users = mock(UserRepository.class);
    private final AdminBootstrapStore admins = mock(AdminBootstrapStore.class);
    private final RefreshSessionStore sessions = mock(RefreshSessionStore.class);
    private final TokenIssuer tokens = mock(TokenIssuer.class);
    private GoogleOidcService service;

    @BeforeEach
    void setUp() {
        service = new GoogleOidcService(flows, identities, verifier, users, admins, sessions, tokens,
                Clock.fixed(NOW, ZoneOffset.UTC), "client-id", "http://localhost/callback", "admin@gmail.com");
    }

    @Test
    void verifiedGoogleEmailLinksExistingAccountAndBootstrapsFirstAdmin() {
        var user = new User(UUID.randomUUID(), "admin@gmail.com", "password-hash", "Admin", false,
                Role.USER, UserStatus.ACTIVE, NOW, NOW);
        var state = arrangeFlow();
        when(verifier.exchangeAndVerify(eq("code"), any(), any())).thenReturn(
                new GoogleTokenVerifier.Profile("google-sub", "admin@gmail.com", true, "Admin", true));
        when(identities.findUserId("google-sub")).thenReturn(Optional.empty());
        when(users.findByEmail("admin@gmail.com")).thenReturn(Optional.of(user));
        when(users.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(admins.promoteFirstVerifiedAdmin(user.id(), user.email())).thenReturn(true);
        when(sessions.create(eq(user.id()), eq(NOW), eq(NOW.plusSeconds(604800))))
                .thenReturn(new RefreshSessionStore.Session(UUID.randomUUID(), "refresh", NOW.plusSeconds(604800)));
        when(tokens.issue(any(User.class), any(UUID.class)))
                .thenReturn(new TokenIssuer.IssuedToken("access", NOW.plusSeconds(1800)));

        var result = service.complete("code", state, state);

        assertEquals("access", result.accessToken());
        verify(identities).link("google-sub", user.id());
        var issuedUser = ArgumentCaptor.forClass(User.class);
        verify(tokens).issue(issuedUser.capture(), any(UUID.class));
        assertEquals(Role.ADMIN, issuedUser.getValue().role());
        assertEquals("password-hash", issuedUser.getValue().passwordHash());
    }

    @Test
    void rejectsUnverifiedEmailBeforeLinking() {
        var state = arrangeFlow();
        when(verifier.exchangeAndVerify(eq("code"), any(), any())).thenReturn(
                new GoogleTokenVerifier.Profile("sub", "admin@gmail.com", false, "Admin", true));

        assertThrows(InvalidCredentialsException.class, () -> service.complete("code", state, state));

        verify(identities, never()).link(any(), any());
        verify(admins, never()).promoteFirstVerifiedAdmin(any(), any());
    }

    @Test
    void rejectsChangedStateBeforeConsumingFlow() {
        var state = arrangeFlow();

        assertThrows(InvalidCredentialsException.class, () -> service.complete("code", state, "changed"));

        verify(flows, never()).consume(any());
    }

    @Test
    void rejectsLinkingExistingEmailGoogleDoesNotManage() {
        var state = arrangeFlow();
        var user = new User(UUID.randomUUID(), "person@example.com", "hash", "Person", false,
                Role.USER, UserStatus.ACTIVE, NOW, NOW);
        when(verifier.exchangeAndVerify(eq("code"), any(), any())).thenReturn(
                new GoogleTokenVerifier.Profile("sub", "person@example.com", true, "Person", false));
        when(identities.findUserId("sub")).thenReturn(Optional.empty());
        when(users.findByEmail("person@example.com")).thenReturn(Optional.of(user));

        assertThrows(InvalidCredentialsException.class, () -> service.complete("code", state, state));

        verify(identities, never()).link(any(), any());
    }

    private String arrangeFlow() {
        var state = service.start().state();
        var hash = ArgumentCaptor.forClass(String.class);
        var nonce = ArgumentCaptor.forClass(String.class);
        var verifierValue = ArgumentCaptor.forClass(String.class);
        verify(flows).save(hash.capture(), nonce.capture(), verifierValue.capture(), eq(NOW.plusSeconds(600)));
        when(flows.consume(hash.getValue())).thenReturn(Optional.of(
                new GoogleFlowStore.Flow(nonce.getValue(), verifierValue.getValue(), NOW.plusSeconds(600))));
        return state;
    }
}
