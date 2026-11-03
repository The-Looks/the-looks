-- Mỗi service một database riêng, không service nào đọc database của service khác.
-- Docker chạy khi tạo volume mới; db-setup chạy lại để bổ sung database trong volume cũ.
-- Postgres cài trên máy: chạy tay bằng psql -U postgres.
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'thelooks') THEN
        CREATE ROLE thelooks LOGIN PASSWORD 'thelooks';
    END IF;
END
$$;

-- \gexec cho phép tạo database ngoài transaction và bỏ qua database đã có.
SELECT format('CREATE DATABASE %I OWNER thelooks', databases.name)
FROM (VALUES ('thelooks_identity'), ('thelooks_wardrobe'), ('thelooks_outfit'),
             ('thelooks_voting'), ('thelooks_billing')) AS databases(name)
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = databases.name)
\gexec
