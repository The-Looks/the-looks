package vn.thelooks.wardrobe.infrastructure.storage;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Duration;
import java.util.HexFormat;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import vn.thelooks.wardrobe.application.port.out.ImageStorage;

/**
 * Cloudinary (gói Free): upload có chữ ký qua REST API, ảnh phục vụ thẳng từ CDN của Cloudinary.
 * public_id chứa UUID ngẫu nhiên nên link ảnh không đoán được.
 *
 * @see <a href="https://cloudinary.com/documentation/upload_images#generating_authentication_signatures">Chữ ký Cloudinary</a>
 */
@Component
@ConditionalOnProperty(name = "thelooks.storage.provider", havingValue = "cloudinary")
class CloudinaryImageStorage implements ImageStorage {

    private final RestClient http;
    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;
    private final Clock clock;

    CloudinaryImageStorage(@Value("${thelooks.storage.cloudinary.cloud-name}") String cloudName,
            @Value("${thelooks.storage.cloudinary.api-key}") String apiKey,
            @Value("${thelooks.storage.cloudinary.api-secret}") String apiSecret, Clock clock) {
        if (cloudName.isBlank() || apiKey.isBlank() || apiSecret.isBlank()) {
            throw new IllegalStateException("Thiếu CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET");
        }
        var requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(5));
        requestFactory.setReadTimeout(Duration.ofSeconds(30));
        this.http = RestClient.builder().baseUrl("https://api.cloudinary.com/v1_1/" + cloudName)
                .requestFactory(requestFactory).build();
        this.cloudName = cloudName;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.clock = clock;
    }

    @Override
    public String store(UUID ownerId, byte[] content, String contentType) {
        String publicId = "thelooks/" + ownerId + "/" + UUID.randomUUID();
        var form = signedForm(Map.of("public_id", publicId));
        form.add("file", new ByteArrayResource(content) {
            @Override
            public String getFilename() {
                return "item.jpg";
            }
        });
        UploadResponse response = http.post().uri("/image/upload").contentType(MediaType.MULTIPART_FORM_DATA)
                .body(form).retrieve().body(UploadResponse.class);
        if (response == null || response.publicId() == null) {
            throw new IllegalStateException("Cloudinary không trả public_id");
        }
        return response.publicId();
    }

    @Override
    public URI url(String key, Duration validity) {
        return URI.create("https://res.cloudinary.com/" + cloudName + "/image/upload/" + key + ".jpg");
    }

    @Override
    public void delete(String key) {
        http.post().uri("/image/destroy").contentType(MediaType.MULTIPART_FORM_DATA)
                .body(signedForm(Map.of("public_id", key))).retrieve().toBodilessEntity();
    }

    private LinkedMultiValueMap<String, Object> signedForm(Map<String, String> params) {
        Map<String, String> signed = new TreeMap<>(params);
        signed.put("timestamp", String.valueOf(clock.instant().getEpochSecond()));
        var form = new LinkedMultiValueMap<String, Object>();
        signed.forEach(form::add);
        form.add("api_key", apiKey);
        form.add("signature", sign(signed, apiSecret));
        return form;
    }

    /** SHA-1 của "k1=v1&k2=v2" (key a→z, không gồm file / api_key) nối api_secret, dạng hex. */
    static String sign(Map<String, String> params, String apiSecret) {
        String payload = new TreeMap<>(params).entrySet().stream()
                .map(e -> e.getKey() + "=" + e.getValue())
                .collect(Collectors.joining("&")) + apiSecret;
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-1").digest(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record UploadResponse(@com.fasterxml.jackson.annotation.JsonProperty("public_id") String publicId) {
    }
}
