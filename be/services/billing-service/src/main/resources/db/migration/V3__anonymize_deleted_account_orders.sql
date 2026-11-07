-- Giữ sổ giao dịch nhưng tách mã tài khoản sau khi người dùng yêu cầu xóa.
ALTER TABLE billing_order ALTER COLUMN owner_id DROP NOT NULL;
