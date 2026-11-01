package vn.thelooks.billing.infrastructure.payment;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;

class PayOsSignatureTest {

    static final String KEY = "checksum-key-for-test";

    @Test
    void signsSortedKeyValuePairs() {
        // Giá trị mong đợi tính độc lập: HMAC-SHA256("amount=39000&cancelUrl=c&description=TL100001&orderCode=100001&returnUrl=r", KEY)
        Map<String, Object> data = Map.of("returnUrl", "r", "orderCode", 100001L, "description", "TL100001",
                "cancelUrl", "c", "amount", 39000L);
        assertThat(PayOsSignature.sign(data, KEY)).isEqualTo(EXPECTED);
    }

    @Test
    void nullValuesAreSignedAsEmpty() {
        Map<String, Object> withNull = new HashMap<>(Map.of("a", "1"));
        withNull.put("b", null);
        assertThat(PayOsSignature.sign(withNull, KEY)).isEqualTo(PayOsSignature.sign(Map.of("a", "1", "b", ""), KEY));
    }

    @Test
    void rejectsTamperedData() {
        Map<String, Object> data = Map.of("orderCode", 100001, "amount", 39000, "code", "00");
        String signature = PayOsSignature.sign(data, KEY);
        assertThat(PayOsSignature.verify(data, signature, KEY)).isTrue();
        assertThat(PayOsSignature.verify(Map.of("orderCode", 100001, "amount", 1000, "code", "00"), signature, KEY)).isFalse();
        assertThat(PayOsSignature.verify(data, signature, "other-key")).isFalse();
        assertThat(PayOsSignature.verify(data, null, KEY)).isFalse();
    }

    static final String EXPECTED = "83e4d6465b13b957dcd138bb7921973b62fac517db87c10a749ff3490ba5cced";
}
