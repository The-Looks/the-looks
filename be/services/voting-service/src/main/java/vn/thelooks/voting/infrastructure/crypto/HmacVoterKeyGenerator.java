package vn.thelooks.voting.infrastructure.crypto;

import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import vn.thelooks.voting.application.port.out.VoterKeyGenerator;

@Component
class HmacVoterKeyGenerator implements VoterKeyGenerator {

    private final SecretKeySpec key;

    HmacVoterKeyGenerator(@Value("${thelooks.voting.voter-key-secret}") String secret) {
        var bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) throw new IllegalArgumentException("VOTER_KEY_SECRET phải có ít nhất 32 byte");
        this.key = new SecretKeySpec(bytes, "HmacSHA256");
    }

    @Override
    public String forIp(String code, String ip) {
        return forPoll(code, "ip:" + ip);
    }

    @Override
    public String forPoll(String code, String voterId) {
        try {
            var mac = Mac.getInstance("HmacSHA256");
            mac.init(key);
            return HexFormat.of().formatHex(mac.doFinal((code + ":" + voterId).getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.GeneralSecurityException e) {
            throw new IllegalStateException("Không tạo được voter key", e);
        }
    }
}
