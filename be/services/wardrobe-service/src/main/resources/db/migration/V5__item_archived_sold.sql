-- Cất đi (ARCHIVED) và đã bán (SOLD): giữ món + ảnh, không vào gợi ý outfit.
alter table wardrobe_item drop constraint wardrobe_item_status_check;
alter table wardrobe_item add constraint wardrobe_item_status_check
    check (status in ('PROCESSING', 'PENDING_REVIEW', 'CONFIRMED', 'RECOGNITION_FAILED', 'ARCHIVED', 'SOLD'));
