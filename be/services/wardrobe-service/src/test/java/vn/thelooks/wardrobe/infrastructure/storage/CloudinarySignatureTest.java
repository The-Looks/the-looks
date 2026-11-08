package vn.thelooks.wardrobe.infrastructure.storage;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Test;

class CloudinarySignatureTest {

    @Test
    void signsSortedParamsWithSecret() {
        // Ví dụ trong tài liệu Cloudinary: eager=w_400,h_300,c_pad|w_260,h_200,c_crop&public_id=sample_image&timestamp=1315060510 + abcd
        Map<String, String> params = Map.of("timestamp", "1315060510", "public_id", "sample_image",
                "eager", "w_400,h_300,c_pad|w_260,h_200,c_crop");
        assertThat(CloudinaryImageStorage.sign(params, "abcd")).isEqualTo("bfd09f95f331f558cbd1320e67aa8d488770583e");
    }

    @Test
    void oldDiskKeysHaveNoImageInsteadOfABrokenCloudinaryLink() {
        var storage = new CloudinaryImageStorage("demo", "key", "secret", java.time.Clock.systemUTC());
        assertThat(storage.url("thelooks/u/1", java.time.Duration.ofHours(1)).toString())
                .isEqualTo("https://res.cloudinary.com/demo/image/upload/thelooks/u/1.jpg");
        assertThat(storage.url("c3436a3c/ce021ddf.jpg", java.time.Duration.ofHours(1))).isNull();
    }
}
