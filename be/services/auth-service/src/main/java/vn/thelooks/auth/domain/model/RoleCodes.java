package vn.thelooks.auth.domain.model;

/** Mã role khởi tạo trong Flyway; role mới có thể thêm qua migration sau. */
public final class RoleCodes {

    public static final String USER = "USER";
    public static final String ADMIN = "ADMIN";

    private RoleCodes() {
    }
}
