package vn.thelooks.wardrobe.api.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Chỉ ADMIN (packages/security chặn /api/admin/**): cấu hình lưu ảnh và AI nhận diện. Chỉ báo có / không có key. */
@RestController
@RequestMapping("/api/admin/wardrobe")
class AdminWardrobeController {

    record Status(String aiProvider, boolean geminiConfigured, boolean anthropicConfigured, String imageStorage,
            boolean cloudinaryConfigured) {}

    private final Status status;

    AdminWardrobeController(@Value("${thelooks.ai.provider}") String aiProvider,
            @Value("${GEMINI_API_KEY:}") String geminiKey,
            @Value("${ANTHROPIC_API_KEY:}") String anthropicKey,
            @Value("${thelooks.storage.provider}") String imageStorage,
            @Value("${thelooks.storage.cloudinary.cloud-name:}") String cloudName,
            @Value("${thelooks.storage.cloudinary.api-key:}") String cloudKey,
            @Value("${thelooks.storage.cloudinary.api-secret:}") String cloudSecret) {
        this.status = new Status(aiProvider, !geminiKey.isBlank(), !anthropicKey.isBlank(), imageStorage,
                !cloudName.isBlank() && !cloudKey.isBlank() && !cloudSecret.isBlank());
    }

    @GetMapping("/status")
    Status status() {
        return status;
    }
}
