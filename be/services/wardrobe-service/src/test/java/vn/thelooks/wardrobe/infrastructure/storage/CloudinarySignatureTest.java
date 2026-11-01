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
}
