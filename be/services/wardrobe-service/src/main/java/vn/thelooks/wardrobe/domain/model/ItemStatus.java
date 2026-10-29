package vn.thelooks.wardrobe.domain.model;

/** Vòng đời món đồ: PROCESSING → PENDING_REVIEW → CONFIRMED (hoặc RECOGNITION_FAILED). */
public enum ItemStatus {
    PROCESSING,
    PENDING_REVIEW,
    CONFIRMED,
    RECOGNITION_FAILED
}
