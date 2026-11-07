package vn.thelooks.auth.application.service;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;
import vn.thelooks.auth.application.port.in.RegisterUseCase;
import vn.thelooks.auth.application.port.out.ConsentStore;
import vn.thelooks.auth.application.port.out.FirstAdminRoleAssigner;
import vn.thelooks.auth.application.port.out.GoogleOAuthFlowStore;
import vn.thelooks.auth.application.port.out.GoogleAccountLinkStore;
import vn.thelooks.auth.application.port.out.GoogleTokenVerifier;
import vn.thelooks.auth.application.port.out.RefreshTokenSessionStore;
import vn.thelooks.auth.application.port.out.TokenIssuer;
import vn.thelooks.auth.application.port.out.UserPersistencePort;
import vn.thelooks.auth.application.port.in.GoogleLoginUseCase;
import vn.thelooks.auth.application.port.in.LoginUseCase;
import vn.thelooks.auth.domain.exception.InvalidCredentialsException;
import vn.thelooks.auth.domain.model.User;
import vn.thelooks.auth.domain.model.RoleCodes;
import vn.thelooks.auth.domain.enums.UserStatus;

@Service
class GoogleOidcService implements GoogleLoginUseCase {

    private static final Logger LOG = LoggerFactory.getLogger(GoogleOidcService.class);
    private static final SecureRandom RANDOM = new SecureRandom();
    private final GoogleOAuthFlowStore flows;
    private final GoogleAccountLinkStore identities;
    private final GoogleTokenVerifier google;
    private final UserPersistencePort users;
    private final FirstAdminRoleAssigner admins;
    private final RefreshTokenSessionStore sessions;
    private final TokenIssuer tokens;
    private final ConsentStore consents;
    private final Clock clock;
    private final String clientId;
    private final String redirectUri;
    private final String adminEmail;

    GoogleOidcService(GoogleOAuthFlowStore flows, GoogleAccountLinkStore identities, GoogleTokenVerifier google,
            UserPersistencePort users, FirstAdminRoleAssigner admins, RefreshTokenSessionStore sessions, TokenIssuer tokens,
            ConsentStore consents, Clock clock, @Value("${thelooks.google.client-id:}") String clientId,
            @Value("${thelooks.google.redirect-uri:}") String redirectUri,
            @Value("${thelooks.admin.bootstrap-email:}") String adminEmail) {
        this.flows = flows;
        this.identities = identities;
        this.google = google;
        this.users = users;
        this.admins = admins;
        this.sessions = sessions;
        this.tokens = tokens;
        this.consents = consents;
        this.clock = clock;
        this.clientId = clientId;
        this.redirectUri = redirectUri;
        this.adminEmail = adminEmail;
    }

    @Override
    public Start start() {
        if (clientId.isBlank() || redirectUri.isBlank()) throw new IllegalStateException("Google OAuth chưa cấu hình");
        var state = random();
        var nonce = random();
        var verifier = random();
        flows.save(sha256(state), nonce, verifier, Instant.now(clock).plus(Duration.ofMinutes(10)));
        URI uri = UriComponentsBuilder.fromUriString("https://accounts.google.com/o/oauth2/v2/auth")
                .queryParam("client_id", clientId).queryParam("redirect_uri", redirectUri)
                .queryParam("response_type", "code").queryParam("scope", "openid email profile")
                .queryParam("state", state).queryParam("nonce", nonce)
                .queryParam("code_challenge", sha256(verifier)).queryParam("code_challenge_method", "S256")
                .build().encode().toUri();
        return new Start(state, uri);
    }

    @Override
    @Transactional
    public LoginUseCase.AuthTokens complete(String code, String state, String stateCookie) {
        if (code == null || code.isBlank() || state == null || stateCookie == null
                || !MessageDigest.isEqual(state.getBytes(StandardCharsets.UTF_8),
                        stateCookie.getBytes(StandardCharsets.UTF_8))) {
            LOG.warn("Google login rejected: missing code/state or state cookie mismatch");
            throw invalid();
        }
        var flow = flows.consume(sha256(state)).orElseThrow(() -> {
            LOG.warn("Google login rejected: OAuth flow missing or already consumed");
            return invalid();
        });
        if (!flow.expiresAt().isAfter(Instant.now(clock))) {
            LOG.warn("Google login rejected: OAuth flow expired");
            throw invalid();
        }
        var profile = google.exchangeAndVerify(code, flow.codeVerifier(), flow.nonce());
        if (!profile.emailVerified()) {
            LOG.warn("Google login rejected: provider email is unverified");
            throw invalid();
        }
        var userId = identities.findUserId(profile.subject()).orElse(null);
        User user;
        if (userId != null) {
            user = users.findById(userId).orElseThrow(GoogleOidcService::invalid);
        } else {
            var email = profile.email().trim().toLowerCase(Locale.ROOT);
            var existing = users.findByEmail(email);
            if (existing.isPresent()) {
                if (!profile.googleAuthoritativeForEmail()) {
                    LOG.warn("Google login rejected: provider does not manage an existing account email");
                    throw invalid();
                }
                user = existing.get();
                if (!user.emailVerified()) {
                    user = users.save(new User(user.id(), user.email(), user.passwordHash(), user.username(), true,
                            user.roles(), user.permissions(), user.status(), user.createdAt(), Instant.now(clock)));
                }
            } else {
                var now = Instant.now(clock);
                var name = profile.name() == null || profile.name().isBlank() ? email.split("@")[0] : profile.name();
                if (name.length() > 60) name = name.substring(0, 60);
                user = users.save(new User(UUID.randomUUID(), email, null, name, true,
                        Set.of(RoleCodes.USER), Set.of(), UserStatus.ACTIVE, now, now));
                // Nút Google ở trang đăng nhập ghi rõ "tiếp tục nghĩa là đồng ý Điều khoản và Chính sách"
                consents.record(user.id(), RegisterUseCase.TERMS_VERSION, now);
            }
            identities.link(profile.subject(), user.id());
        }
        if (user.status() != UserStatus.ACTIVE) throw invalid();
        if (!adminEmail.isBlank() && profile.googleAuthoritativeForEmail() && user.emailVerified()
                && user.email().equalsIgnoreCase(adminEmail.trim())) {
            if (admins.promoteFirstVerifiedAdmin(user.id(), user.email())) {
                user = users.findById(user.id()).orElseThrow(GoogleOidcService::invalid);
            }
        }
        var now = Instant.now(clock);
        var session = sessions.create(user.id(), now, now.plus(Duration.ofDays(7)));
        var access = tokens.issue(user, session.id());
        return new LoginUseCase.AuthTokens(access.token(), access.expiresAt(),
                session.refreshToken(), session.expiresAt());
    }

    private static String random() {
        var bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String sha256(String value) {
        try {
            return Base64.getUrlEncoder().withoutPadding().encodeToString(
                    MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    private static InvalidCredentialsException invalid() {
        return new InvalidCredentialsException("Google đăng nhập không hợp lệ");
    }
}
