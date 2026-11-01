-- Mỗi service một database riêng, không service nào đọc database của service khác.
-- docker-compose chạy file này khi tạo container Postgres lần đầu. Postgres cài trên máy: chạy tay bằng psql -U postgres.
CREATE ROLE thelooks LOGIN PASSWORD 'thelooks';
CREATE DATABASE thelooks_identity OWNER thelooks;
CREATE DATABASE thelooks_wardrobe OWNER thelooks;
CREATE DATABASE thelooks_outfit   OWNER thelooks;
CREATE DATABASE thelooks_voting   OWNER thelooks;
CREATE DATABASE thelooks_billing  OWNER thelooks;
