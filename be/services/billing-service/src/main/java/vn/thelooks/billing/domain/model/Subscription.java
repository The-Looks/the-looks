package vn.thelooks.billing.domain.model;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

/**
 * Gói trả phí hiện tại của một người. Hết hạn thì coi như FREE.
 * Bật tự gia hạn (mặc định): nhắc từ {@link #REMIND_BEFORE} trước ngày hết hạn, và giữ quyền lợi thêm {@link #GRACE}
 * sau ngày hết hạn để người dùng kịp trả. Tắt tự gia hạn: hết hạn là về FREE ngay.
 */
public record Subscription(UUID ownerId, Plan plan, BillingPeriod period, Instant expiresAt, boolean autoRenew) {

    public static final Duration REMIND_BEFORE = Duration.ofDays(3);
    public static final Duration GRACE = Duration.ofDays(3);

    public enum Status {
        ACTIVE,
        /** Sắp hết hạn: nhắc gia hạn. */
        RENEWAL_DUE,
        /** Đã quá hạn nhưng còn trong thời gian ân hạn. */
        GRACE
    }

    public boolean activeAt(Instant now) {
        return now.isBefore(autoRenew ? expiresAt.plus(GRACE) : expiresAt);
    }

    /** Chỉ có nghĩa khi {@link #activeAt} đúng. */
    public Status statusAt(Instant now) {
        if (!now.isBefore(expiresAt)) {
            return Status.GRACE;
        }
        return now.isBefore(expiresAt.minus(REMIND_BEFORE)) ? Status.ACTIVE : Status.RENEWAL_DUE;
    }

    public Subscription withAutoRenew(boolean enabled) {
        return new Subscription(ownerId, plan, period, expiresAt, enabled);
    }
}
