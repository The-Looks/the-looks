-- Đơn mua gói. order_code là mã gửi sang cổng thanh toán (PayOS yêu cầu số nguyên dương).
create table billing_order (
    order_code   bigint generated always as identity (start with 100001) primary key,
    owner_id     uuid        not null,
    plan         varchar(10) not null check (plan in ('PLUS', 'PRO')),
    period       varchar(10) not null check (period in ('MONTHLY', 'YEARLY')),
    amount_vnd   bigint      not null check (amount_vnd > 0),
    status       varchar(10) not null check (status in ('PENDING', 'PAID', 'CANCELLED')),
    checkout_url text,
    created_at   timestamptz not null,
    paid_at      timestamptz
);
create index idx_billing_order_owner on billing_order (owner_id, created_at desc);

-- Gói hiện tại của mỗi người. Không có dòng hoặc đã hết hạn = FREE.
create table billing_subscription (
    owner_id   uuid primary key,
    plan       varchar(10) not null check (plan in ('PLUS', 'PRO')),
    expires_at timestamptz not null,
    updated_at timestamptz not null
);
