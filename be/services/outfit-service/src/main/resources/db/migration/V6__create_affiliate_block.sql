-- Sản phẩm admin chặn khỏi "Gợi ý mua thêm" (hàng giả, shop kém, nội dung không phù hợp).
create table affiliate_blocked_product (
    source     varchar(30)  not null,
    product_id varchar(64)  not null,
    title      varchar(300) not null default '',
    blocked_by uuid         not null,
    blocked_at timestamptz  not null,
    primary key (source, product_id)
);
