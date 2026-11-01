-- Lần quét ảnh: 1..10 ảnh, mỗi ảnh có thể ra nhiều món. Ảnh gốc không lưu.
create table wardrobe_scan (
    id                uuid primary key,
    owner_id          uuid        not null,
    status            varchar(12) not null check (status in ('PROCESSING', 'DONE', 'FAILED')),
    image_count       int         not null,
    skipped_for_limit int         not null default 0,
    created_at        timestamptz not null
);
create index idx_wardrobe_scan_owner on wardrobe_scan (owner_id, created_at desc);

-- colors / seasons / style_tags: danh sách nối bằng dấu phẩy (giá trị là nhãn ngắn, không chứa dấu phẩy)
create table wardrobe_item (
    id         uuid primary key,
    owner_id   uuid         not null,
    image_key  varchar(300) not null,
    status     varchar(20)  not null check (status in ('PROCESSING', 'PENDING_REVIEW', 'CONFIRMED', 'RECOGNITION_FAILED')),
    category   varchar(20),
    colors     varchar(300) not null default '',
    material   varchar(60),
    seasons    varchar(60)  not null default '',
    style_tags varchar(300) not null default '',
    confidence double precision,
    scan_id    uuid references wardrobe_scan (id) on delete set null,
    created_at timestamptz  not null
);
create index idx_wardrobe_item_owner on wardrobe_item (owner_id, status, created_at desc);
create index idx_wardrobe_item_scan on wardrobe_item (scan_id);
