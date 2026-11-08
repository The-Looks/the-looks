package vn.thelooks.wardrobe.domain.model;

import java.util.Set;

/**
 * Vòng đời món đồ: PROCESSING → PENDING_REVIEW → CONFIRMED (hoặc RECOGNITION_FAILED).
 * Món đã xác nhận có thể cất đi (ARCHIVED) hoặc đánh dấu đã bán (SOLD), và đưa lại vào tủ (CONFIRMED).
 */
public enum ItemStatus {
    PROCESSING,
    PENDING_REVIEW,
    CONFIRMED,
    RECOGNITION_FAILED,
    ARCHIVED,
    SOLD;

    /** Trạng thái người dùng tự chuyển qua lại; món cất đi / đã bán không vào gợi ý outfit. */
    public static final Set<ItemStatus> OWNED = Set.of(CONFIRMED, ARCHIVED, SOLD);
}
