-- Admin hoàn tiền một đơn đã thanh toán: PAID → REFUNDED, ghi thời điểm, lý do và admin thực hiện.
alter table billing_order drop constraint billing_order_status_check;
alter table billing_order add constraint billing_order_status_check
    check (status in ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED'));
alter table billing_order
    add column refunded_at   timestamptz,
    add column refund_reason varchar(300),
    add column refunded_by   uuid;
create index idx_billing_order_status on billing_order (status, created_at desc);
