-- Tự gia hạn: nhớ kỳ đang dùng để gia hạn đúng kỳ, và cho người dùng tắt tự gia hạn.
alter table billing_subscription
    add column period     varchar(10) not null default 'MONTHLY' check (period in ('MONTHLY', 'YEARLY')),
    add column auto_renew boolean     not null default true;
