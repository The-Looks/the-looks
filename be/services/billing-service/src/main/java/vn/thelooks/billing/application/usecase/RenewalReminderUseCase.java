package vn.thelooks.billing.application.usecase;

import java.util.UUID;

/** Email nhắc gia hạn trước {@code Subscription.REMIND_BEFORE}. */
public interface RenewalReminderUseCase {

    /** Lưu email của người đang thanh toán để sau này gửi nhắc. Lỗi chỉ ghi log. */
    void rememberContact(UUID ownerId);

    /** Gửi nhắc cho các gói sắp hết hạn chưa được nhắc. Trả số email đã gửi. */
    int remindDue();
}
