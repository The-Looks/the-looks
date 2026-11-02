package vn.thelooks.auth.domain.exception;

/** Email đã được đăng ký. API trả 409. */
public class UserAlreadyExistsException extends RuntimeException {

    public UserAlreadyExistsException(String message) {
        super(message);
    }
}
