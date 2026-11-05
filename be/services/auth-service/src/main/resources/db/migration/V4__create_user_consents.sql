-- Bằng chứng người dùng đồng ý Điều khoản sử dụng và Chính sách quyền riêng tư (Luật Bảo vệ dữ liệu cá nhân).
-- Mỗi lần đồng ý một phiên bản là một dòng; đổi nội dung điều khoản thì tăng phiên bản.
CREATE TABLE user_consents (
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    version     VARCHAR(20) NOT NULL,
    accepted_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (user_id, version)
);
