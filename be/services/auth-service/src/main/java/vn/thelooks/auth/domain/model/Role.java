package vn.thelooks.auth.domain.model;

import java.util.List;

/** Vai trò và các mã quyền đang được gán. Không phụ thuộc persistence hay Spring. */
public record Role(String code, String name, List<String> permissions, boolean system) {
    public Role { permissions = List.copyOf(permissions); }
}
