package vn.thelooks.billing.application.port.out;

/** Gửi email nhắc gia hạn. */
public interface RenewalMailer {

    /** false khi chưa cấu hình nhà cung cấp email: không gửi, không đánh dấu đã nhắc. */
    boolean enabled();

    /** @throws RuntimeException khi gửi lỗi; lần chạy sau sẽ thử lại. */
    void send(RenewalReminderRepository.Due due);
}
