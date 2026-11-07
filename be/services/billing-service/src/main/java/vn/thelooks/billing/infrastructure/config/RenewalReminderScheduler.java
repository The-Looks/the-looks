package vn.thelooks.billing.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import vn.thelooks.billing.application.usecase.RenewalReminderUseCase;

/**
 * Mỗi giờ quét gói sắp hết hạn. Render free có thể ngủ: lần chạy bị lỡ sẽ bắt kịp khi service thức
 * (khoảng nhắc dài 3 ngày, mỗi kỳ chỉ gửi một lần).
 */
@Configuration
@EnableScheduling
class RenewalReminderScheduler {

    private final RenewalReminderUseCase reminders;

    RenewalReminderScheduler(RenewalReminderUseCase reminders) {
        this.reminders = reminders;
    }

    @Scheduled(initialDelayString = "${thelooks.billing.reminder-initial-delay-ms:60000}",
            fixedDelayString = "${thelooks.billing.reminder-interval-ms:3600000}")
    void remind() {
        reminders.remindDue();
    }
}
