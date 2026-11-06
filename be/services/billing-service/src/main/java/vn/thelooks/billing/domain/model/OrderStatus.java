package vn.thelooks.billing.domain.model;

public enum OrderStatus {
    PENDING,
    PAID,
    CANCELLED,
    /** Admin đã hoàn tiền; thời gian gói của đơn này đã bị trừ lại. */
    REFUNDED
}
