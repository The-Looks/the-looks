package vn.thelooks.billing.infrastructure.payment;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/**
 * Chữ ký PayOS: HMAC-SHA256 (checksum key) trên chuỗi "key1=value1&key2=value2" với key sắp xếp a→z.
 * Giá trị null được ghi là chuỗi rỗng.
 */
// ponytail: chưa xử lý giá trị là mảng/đối tượng lồng nhau; dữ liệu webhook thanh toán của PayOS hiện chỉ có giá trị đơn
final class PayOsSignature {

    private PayOsSignature() {
    }

    static String sign(Map<String, ?> data, String checksumKey) {
        String payload = new TreeMap<>(data).entrySet().stream()
                .map(e -> e.getKey() + "=" + text(e.getValue()))
                .collect(Collectors.joining("&"));
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(checksumKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Không tính được chữ ký PayOS", e);
        }
    }

    /** So sánh thời gian cố định để không lộ chữ ký qua thời gian phản hồi. */
    static boolean verify(Map<String, ?> data, String signature, String checksumKey) {
        if (signature == null) {
            return false;
        }
        return MessageDigest.isEqual(sign(data, checksumKey).getBytes(StandardCharsets.UTF_8),
                signature.toLowerCase().getBytes(StandardCharsets.UTF_8));
    }

    private static String text(Object value) {
        if (value == null || "null".equals(value) || "undefined".equals(value)) {
            return "";
        }
        return String.valueOf(value);
    }
}
