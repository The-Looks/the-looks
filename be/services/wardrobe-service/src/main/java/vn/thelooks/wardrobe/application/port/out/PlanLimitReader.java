package vn.thelooks.wardrobe.application.port.out;

/**
 * Số món tối đa trong tủ theo gói của người dùng hiện tại.
 * Cài đặt: client gọi billing-service GET /api/app/billing/me (chuyển tiếp JWT), đọc {@code limits.wardrobeItems}.
 * billing-service không phản hồi → dùng giới hạn của gói Free (50) để không chặn người dùng hoàn toàn.
 */
public interface PlanLimitReader {

    /** @return null = không giới hạn (gói Pro) */
    Integer maxWardrobeItems();
}
