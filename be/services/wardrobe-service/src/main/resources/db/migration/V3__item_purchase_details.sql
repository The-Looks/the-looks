-- Thông tin mua hàng là tuỳ chọn; món đã có vẫn giữ NULL.
alter table wardrobe_item
    add column purchase_price numeric(14, 2),
    add column purchase_date date,
    add column brand varchar(100),
    add constraint chk_wardrobe_item_purchase_price check (purchase_price >= 0);
