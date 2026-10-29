package vn.thelooks.wardrobe.application.port.out;

import vn.thelooks.wardrobe.domain.model.ClothingAttributes;

/** AI nhận diện quần áo từ ảnh. Cài đặt: adapter/out/ai (gọi AI thật, hoặc Fake khi dev/test). */
public interface ClothingRecognizer {

    Recognition recognize(byte[] image, String contentType);

    /** @param confidence 0..1, dùng để nhắc người dùng kiểm tra kỹ khi thấp */
    record Recognition(ClothingAttributes attributes, double confidence) {
    }
}
