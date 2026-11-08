-- Màu yêu thích người dùng tự khai (khảo sát phong cách), nối bằng dấu phẩy như styles.
alter table outfit_preferences add column colors varchar(200) not null default '';
