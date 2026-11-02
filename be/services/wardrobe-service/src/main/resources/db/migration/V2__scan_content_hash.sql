-- Chống tạo trùng: cùng người gửi đúng bộ ảnh này trong vài phút (bấm 2 lần, mạng gửi lại) thì dùng lại lần quét cũ.
alter table wardrobe_scan add column content_hash varchar(64);
create index idx_wardrobe_scan_hash on wardrobe_scan (owner_id, content_hash, created_at desc);
