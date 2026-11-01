package vn.thelooks.wardrobe.domain.model;

/** PROCESSING → DONE (đã tạo các món PENDING_REVIEW) hoặc FAILED (không đọc được ảnh / AI lỗi). */
public enum ScanStatus {
    PROCESSING,
    DONE,
    FAILED
}
