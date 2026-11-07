ALTER TABLE roles ADD COLUMN system_role BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE permissions ADD COLUMN system_permission BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE roles SET system_role = TRUE WHERE code IN ('USER', 'ADMIN');
UPDATE permissions SET system_permission = TRUE WHERE code IN ('ACCOUNT_READ_SELF', 'ADMIN_ACCESS');

INSERT INTO permissions (code, description, system_permission) VALUES
 ('USER_MANAGE', 'Khóa, mở và xem chi tiết tài khoản', TRUE),
 ('ROLE_MANAGE', 'Quản lý vai trò và quyền hạn', TRUE),
 ('AUDIT_READ', 'Xem nhật ký quản trị', TRUE),
 ('REPORT_MODERATE', 'Xử lý báo cáo bình chọn', TRUE),
 ('USER_DELETE', 'Xóa tài khoản theo yêu cầu', TRUE);
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'ADMIN' AND p.code IN
 ('USER_MANAGE', 'ROLE_MANAGE', 'AUDIT_READ', 'REPORT_MODERATE', 'USER_DELETE');

CREATE TABLE admin_audit (
 id UUID PRIMARY KEY,
 actor_id UUID NOT NULL,
 target_id VARCHAR(160),
 action VARCHAR(80) NOT NULL,
 detail VARCHAR(500),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX admin_audit_created_idx ON admin_audit (created_at DESC);
CREATE INDEX admin_audit_target_idx ON admin_audit (target_id, created_at DESC);
