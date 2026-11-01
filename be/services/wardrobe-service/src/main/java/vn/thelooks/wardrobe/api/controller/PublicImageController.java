package vn.thelooks.wardrobe.api.controller;

import java.time.Duration;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.wardrobe.application.port.out.ImageStorage;

/** Ảnh món đồ khi lưu local (dev). Đường dẫn chứa 2 UUID ngẫu nhiên nên không đoán được; Cloudinary không dùng endpoint này. */
@RestController
class PublicImageController {

    private final ImageStorage storage;

    PublicImageController(ImageStorage storage) {
        this.storage = storage;
    }

    @GetMapping("/api/public/wardrobe/images/{owner}/{file}")
    ResponseEntity<byte[]> image(@PathVariable String owner, @PathVariable String file) {
        return storage.read(owner + "/" + file)
                .map(bytes -> ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePrivate())
                        .body(bytes))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
