-- Lượt bấm "Xem trên sàn": đo tỉ lệ bấm, đối chiếu hoa hồng theo sub_id (ẩn danh) với báo cáo AccessTrade.
create table affiliate_click (
    id         bigint generated always as identity primary key,
    owner_id   uuid         not null,
    sub_id     varchar(32)  not null,
    source     varchar(30)  not null,
    product_id varchar(64)  not null,
    title      varchar(300) not null,
    created_at timestamptz  not null
);
create index idx_affiliate_click_time on affiliate_click (created_at desc);
