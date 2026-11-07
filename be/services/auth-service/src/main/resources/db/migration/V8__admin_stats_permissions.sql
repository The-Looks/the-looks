INSERT INTO permissions (code, description, system_permission) VALUES
 ('BILLING_STATS_READ', 'Xem thống kê gói và doanh thu', TRUE),
 ('AI_USAGE_READ', 'Xem chi phí AI', TRUE),
 ('AFFILIATE_STATS_READ', 'Xem thống kê affiliate', TRUE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'ADMIN' AND p.code IN ('BILLING_STATS_READ','AI_USAGE_READ','AFFILIATE_STATS_READ')
ON CONFLICT DO NOTHING;
