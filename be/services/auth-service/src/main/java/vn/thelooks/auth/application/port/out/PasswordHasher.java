package vn.thelooks.auth.application.port.out;

/** Cài đặt: adapter bọc BCrypt/Argon2 của Spring Security. */
public interface PasswordHasher {

    String hash(String rawPassword);

    boolean matches(String rawPassword, String hash);
}
