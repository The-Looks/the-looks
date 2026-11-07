package vn.thelooks.auth.infrastructure.persistence.adapter;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import vn.thelooks.auth.application.port.out.AdminIdentityRepositoryPort;
import vn.thelooks.auth.domain.model.AdminUserDetail;
import vn.thelooks.auth.domain.model.AuditLog;
import vn.thelooks.auth.domain.model.Permission;
import vn.thelooks.auth.domain.model.Role;

@Repository
class AdminIdentityRepositoryAdapter implements AdminIdentityRepositoryPort {
    private static final Pattern CODE = Pattern.compile("[A-Z][A-Z0-9_]{2,63}");
    private final JdbcTemplate jdbc;

    AdminIdentityRepositoryAdapter(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Override
    public List<Role> roles() {
        return jdbc.query("SELECT code,name,system_role FROM roles ORDER BY code",
                (rs, row) -> role(rs.getString(1), rs.getString(2), rs.getBoolean(3)));
    }

    private Role role(String code, String name, boolean system) {
        return new Role(code, name, jdbc.query("""
                SELECT p.code FROM permissions p JOIN role_permissions rp ON p.id=rp.permission_id
                JOIN roles r ON r.id=rp.role_id WHERE r.code=? ORDER BY p.code
                """, (rs, row) -> rs.getString(1), code), system);
    }

    private Role requireRole(String code) {
        return roles().stream().filter(r -> r.code().equals(code)).findFirst()
                .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Không tìm thấy vai trò"));
    }

    @Override @Transactional
    public Role createRole(UUID actor, String code, String name) {
        code = checkedCode(code);
        name = checkedText(name, 120);
        if (jdbc.update("INSERT INTO roles(code,name) VALUES (?,?) ON CONFLICT DO NOTHING", code, name) == 0)
            throw error(HttpStatus.CONFLICT, "Mã vai trò đã tồn tại");
        log(actor, code, "ROLE_CREATE", name);
        return requireRole(code);
    }

    @Override @Transactional
    public Role updateRole(UUID actor, String code, String name) {
        name = checkedText(name, 120);
        if (jdbc.update("UPDATE roles SET name=?,updated_at=now() WHERE code=?", name, code) == 0)
            throw error(HttpStatus.NOT_FOUND, "Không tìm thấy vai trò");
        log(actor, code, "ROLE_UPDATE", name);
        return requireRole(code);
    }

    @Override @Transactional
    public void deleteRole(UUID actor, String code) {
        Role role = requireRole(code);
        if (role.system()) throw error(HttpStatus.CONFLICT, "Không thể xóa vai trò hệ thống");
        Long count = jdbc.queryForObject("SELECT count(*) FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE r.code=?", Long.class, code);
        if (count != null && count > 0) throw error(HttpStatus.CONFLICT, "Vai trò còn được gán cho người dùng");
        jdbc.update("DELETE FROM roles WHERE code=?", code);
        log(actor, code, "ROLE_DELETE", null);
    }

    @Override @Transactional
    public Role setRolePermissions(UUID actor, String code, List<String> permissions) {
        jdbc.execute("SELECT pg_advisory_xact_lock(83104212)");
        requireRole(code);
        if (permissions == null || permissions.size() > 100 || permissions.stream().anyMatch(p -> p == null || !CODE.matcher(p).matches()))
            throw error(HttpStatus.BAD_REQUEST, "Danh sách quyền không hợp lệ");
        for (String permission : permissions) requirePermission(permission);
        if (code.equals("ADMIN") && (!permissions.contains("ADMIN_ACCESS") || !permissions.contains("ROLE_MANAGE")))
            throw error(HttpStatus.CONFLICT, "ADMIN phải giữ quyền truy cập và quản lý vai trò");
        if (code.equals("USER") && !permissions.contains("ACCOUNT_READ_SELF"))
            throw error(HttpStatus.CONFLICT, "USER phải giữ quyền xem tài khoản");
        if (!permissions.contains("ADMIN_ACCESS")) {
            Boolean actorHasRole = jdbc.queryForObject("""
                    SELECT EXISTS(SELECT 1 FROM user_roles ur JOIN roles r ON r.id=ur.role_id
                    WHERE ur.user_id=? AND r.code=?)
                    """, Boolean.class, actor, code);
            Long otherAdminRoles = jdbc.queryForObject("""
                    SELECT count(*) FROM user_roles ur JOIN roles r ON r.id=ur.role_id
                    JOIN role_permissions rp ON rp.role_id=r.id JOIN permissions p ON p.id=rp.permission_id
                    WHERE ur.user_id=? AND r.code<>? AND p.code='ADMIN_ACCESS'
                    """, Long.class, actor, code);
            if (Boolean.TRUE.equals(actorHasRole) && (otherAdminRoles == null || otherAdminRoles == 0))
                throw error(HttpStatus.CONFLICT, "Không thể tự gỡ quyền quản trị của chính mình");
        }
        jdbc.update("DELETE FROM role_permissions WHERE role_id=(SELECT id FROM roles WHERE code=?)", code);
        for (String permission : permissions.stream().distinct().toList())
            jdbc.update("INSERT INTO role_permissions(role_id,permission_id) SELECT r.id,p.id FROM roles r,permissions p WHERE r.code=? AND p.code=?", code, permission);
        revokeRoleMembers(code);
        log(actor, code, "ROLE_PERMISSIONS", String.join(",", permissions));
        return requireRole(code);
    }

    @Override
    public List<Permission> permissions() {
        return jdbc.query("SELECT code,description,system_permission FROM permissions ORDER BY code",
                (rs, row) -> new Permission(rs.getString(1), rs.getString(2), rs.getBoolean(3)));
    }

    private Permission requirePermission(String code) {
        return permissions().stream().filter(p -> p.code().equals(code)).findFirst()
                .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Không tìm thấy quyền"));
    }

    @Override @Transactional
    public Permission createPermission(UUID actor, String code, String description) {
        code = checkedCode(code);
        description = checkedText(description, 255);
        if (jdbc.update("INSERT INTO permissions(code,description) VALUES (?,?) ON CONFLICT DO NOTHING", code, description) == 0)
            throw error(HttpStatus.CONFLICT, "Mã quyền đã tồn tại");
        log(actor, code, "PERMISSION_CREATE", description);
        return requirePermission(code);
    }

    @Override @Transactional
    public Permission updatePermission(UUID actor, String code, String description) {
        description = checkedText(description, 255);
        if (jdbc.update("UPDATE permissions SET description=?,updated_at=now() WHERE code=?", description, code) == 0)
            throw error(HttpStatus.NOT_FOUND, "Không tìm thấy quyền");
        log(actor, code, "PERMISSION_UPDATE", description);
        return requirePermission(code);
    }

    @Override @Transactional
    public void deletePermission(UUID actor, String code) {
        Permission permission = requirePermission(code);
        if (permission.system()) throw error(HttpStatus.CONFLICT, "Không thể xóa quyền hệ thống");
        Long count = jdbc.queryForObject("SELECT count(*) FROM role_permissions rp JOIN permissions p ON p.id=rp.permission_id WHERE p.code=?", Long.class, code);
        if (count != null && count > 0) throw error(HttpStatus.CONFLICT, "Quyền còn được gán cho vai trò");
        jdbc.update("DELETE FROM permissions WHERE code=?", code);
        log(actor, code, "PERMISSION_DELETE", null);
    }

    @Override
    public AdminUserDetail user(UUID id) {
        var rows = jdbc.query("SELECT id,username,email,status,email_verified,created_at FROM users WHERE id=?",
                (rs, row) -> userRow(rs), id);
        if (rows.isEmpty()) throw error(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản");
        return rows.getFirst();
    }

    private AdminUserDetail userRow(ResultSet rs) throws SQLException {
        UUID id = rs.getObject("id", UUID.class);
        return new AdminUserDetail(id, rs.getString("username"), rs.getString("email"), rs.getString("status"),
                rs.getBoolean("email_verified"), rs.getTimestamp("created_at").toInstant(),
                jdbc.query("SELECT r.code FROM roles r JOIN user_roles ur ON ur.role_id=r.id WHERE ur.user_id=? ORDER BY r.code",
                        (r, row) -> r.getString(1), id),
                jdbc.query("""
                        SELECT DISTINCT p.code FROM permissions p JOIN role_permissions rp ON rp.permission_id=p.id
                        JOIN user_roles ur ON ur.role_id=rp.role_id WHERE ur.user_id=? ORDER BY p.code
                        """, (r, row) -> r.getString(1), id));
    }

    @Override @Transactional
    public AdminUserDetail setStatus(UUID actor, UUID target, String status) {
        jdbc.execute("SELECT pg_advisory_xact_lock(83104212)");
        if (!"ACTIVE".equals(status) && !"LOCKED".equals(status)) throw error(HttpStatus.BAD_REQUEST, "Trạng thái không hợp lệ");
        if (actor.equals(target)) throw error(HttpStatus.CONFLICT, "Không thể khóa tài khoản của chính mình");
        user(target);
        if ("ACTIVE".equals(status) && deletionInProgress(target))
            throw error(HttpStatus.CONFLICT, "Tài khoản đang trong quy trình xóa");
        if (status.equals("LOCKED")) {
            Boolean isAdmin = jdbc.queryForObject("""
                    SELECT EXISTS(SELECT 1 FROM user_roles ur JOIN roles r ON r.id=ur.role_id
                    WHERE ur.user_id=? AND r.code='ADMIN')
                    """, Boolean.class, target);
            if (Boolean.TRUE.equals(isAdmin)) {
                Long activeAdmins = jdbc.queryForObject("""
                        SELECT count(*) FROM users u JOIN user_roles ur ON ur.user_id=u.id
                        JOIN roles r ON r.id=ur.role_id WHERE r.code='ADMIN' AND u.status='ACTIVE'
                        """, Long.class);
                if (activeAdmins == null || activeAdmins <= 1)
                    throw error(HttpStatus.CONFLICT, "Không thể khóa quản trị viên cuối cùng");
            }
        }
        jdbc.update("UPDATE users SET status=?,updated_at=now() WHERE id=?", status, target);
        if (status.equals("LOCKED")) revoke(target);
        log(actor, target.toString(), status.equals("LOCKED") ? "USER_LOCK" : "USER_UNLOCK", null);
        return user(target);
    }

    @Override @Transactional
    public AdminUserDetail setUserRole(UUID actor, UUID target, String role, boolean grant) {
        jdbc.execute("SELECT pg_advisory_xact_lock(83104212)");
        if (actor.equals(target)) throw error(HttpStatus.CONFLICT, "Không thể tự thay đổi vai trò");
        user(target);
        if (deletionInProgress(target)) throw error(HttpStatus.CONFLICT, "Tài khoản đang trong quy trình xóa");
        requireRole(role);
        if (!grant && role.equals("USER")) throw error(HttpStatus.CONFLICT, "Không thể gỡ vai trò USER");
        if (!grant && role.equals("ADMIN")) {
            Long admins = jdbc.queryForObject("""
                    SELECT count(*) FROM user_roles ur JOIN roles r ON r.id=ur.role_id
                    JOIN users u ON u.id=ur.user_id WHERE r.code='ADMIN' AND u.status='ACTIVE'
                    """, Long.class);
            if (admins == null || admins <= 1) throw error(HttpStatus.CONFLICT, "Phải còn ít nhất một quản trị viên");
        }
        if (grant) jdbc.update("INSERT INTO user_roles(user_id,role_id) SELECT ?,id FROM roles WHERE code=? ON CONFLICT DO NOTHING", target, role);
        else jdbc.update("DELETE FROM user_roles WHERE user_id=? AND role_id=(SELECT id FROM roles WHERE code=?)", target, role);
        revoke(target);
        log(actor, target.toString(), grant ? "USER_ROLE_GRANT" : "USER_ROLE_REVOKE", role);
        return user(target);
    }

    @Override
    public List<AuditLog> audit(String search, String outcome, int limit) {
        if (!List.of("ALL", "SUCCESS", "FAILED").contains(outcome))
            throw error(HttpStatus.BAD_REQUEST, "Kết quả lọc không hợp lệ");
        int safeLimit = Math.clamp(limit, 1, 100);
        String q = search == null ? "" : search.trim();
        return jdbc.query("""
                SELECT id,actor_id,target_id,action,detail,outcome,created_at FROM admin_audit
                WHERE (?='' OR action ILIKE ? OR target_id ILIKE ? OR detail ILIKE ?)
                  AND (?='ALL' OR outcome=?)
                ORDER BY created_at DESC LIMIT ?
                """, (rs, row) -> new AuditLog(rs.getObject(1, UUID.class), rs.getObject(2, UUID.class),
                rs.getString(3), rs.getString(4), rs.getString(5), rs.getString(6), rs.getTimestamp(7).toInstant()),
                q, "%"+q+"%", "%"+q+"%", "%"+q+"%", outcome, outcome, safeLimit);
    }

    private void revoke(UUID user) {
        jdbc.update("UPDATE refresh_sessions SET revoked_at=COALESCE(revoked_at,now()),updated_at=now() WHERE user_id=?", user);
    }
    private boolean deletionInProgress(UUID user) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM account_deletions WHERE target_id=? AND status<>'DONE')",
                Boolean.class, user));
    }
    private void revokeRoleMembers(String role) {
        jdbc.update("""
                UPDATE refresh_sessions SET revoked_at=COALESCE(revoked_at,now()),updated_at=now()
                WHERE user_id IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE r.code=?)
                """, role);
    }
    private void log(UUID actor, String target, String action, String detail) {
        jdbc.update("INSERT INTO admin_audit(id,actor_id,target_id,action,detail) VALUES (?,?,?,?,?)",
                UUID.randomUUID(), actor, target, action, detail);
    }
    private static String checkedCode(String value) {
        if (value == null || !CODE.matcher(value).matches()) throw error(HttpStatus.BAD_REQUEST, "Mã phải gồm chữ hoa, số hoặc _ và dài 3–64 ký tự");
        return value;
    }
    private static String checkedText(String value, int max) {
        if (value == null || value.isBlank() || value.length() > max) throw error(HttpStatus.BAD_REQUEST, "Tên hoặc mô tả không hợp lệ");
        return value.trim();
    }
    private static ResponseStatusException error(HttpStatus status, String detail) {
        return new ResponseStatusException(status, detail);
    }
}
