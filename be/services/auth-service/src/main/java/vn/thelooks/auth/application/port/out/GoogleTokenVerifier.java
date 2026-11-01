package vn.thelooks.auth.application.port.out;

public interface GoogleTokenVerifier {

    Profile exchangeAndVerify(String code, String codeVerifier, String expectedNonce);

    record Profile(String subject, String email, boolean emailVerified, String name,
            boolean googleAuthoritativeForEmail) {
    }
}
