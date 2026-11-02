package vn.thelooks.auth.infrastructure.crypto;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.stereotype.Component;
import vn.thelooks.auth.application.port.out.PasswordHasher;

/** HMAC-SHA-256 với pepper bí mật, sau đó Argon2id có salt riêng cho từng mật khẩu. */
@Component
class PepperedArgon2PasswordHasher implements PasswordHasher {

    private final SecretKeySpec pepper;
    private final Argon2PasswordEncoder argon2 = Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8();

    PepperedArgon2PasswordHasher(@Value("${thelooks.security.password-pepper}") String secret) {
        var bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) throw new IllegalArgumentException("PASSWORD_PEPPER phải có ít nhất 32 byte");
        this.pepper = new SecretKeySpec(bytes, "HmacSHA256");
    }

    @Override
    public String hash(String rawPassword) {
        return argon2.encode(prehash(rawPassword));
    }

    @Override
    public boolean matches(String rawPassword, String hash) {
        return hash != null && argon2.matches(prehash(rawPassword), hash);
    }

    private String prehash(String rawPassword) {
        try {
            var mac = Mac.getInstance("HmacSHA256");
            mac.init(pepper);
            return Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(mac.doFinal(rawPassword.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.GeneralSecurityException e) {
            throw new IllegalStateException("Không băm được mật khẩu", e);
        }
    }
}
