-- Email nhắc gia hạn: email lấy từ auth-service lúc người dùng bấm thanh toán (đang đăng nhập).
create table billing_contact (
    owner_id   uuid primary key,
    email      varchar(320) not null,
    updated_at timestamptz  not null default now()
);
create trigger billing_contact_owner_guard before insert or update on billing_contact
    for each row execute function reject_deleted_billing_owner();

-- Đã gửi nhắc cho kỳ hết hạn nào; gia hạn xong expires_at đổi nên kỳ sau được nhắc lại.
alter table billing_subscription add column reminded_for_expiry timestamptz;
