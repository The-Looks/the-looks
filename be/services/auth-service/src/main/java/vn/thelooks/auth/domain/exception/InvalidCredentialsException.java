package vn.thelooks.auth.domain.exception;

/** Sai email hoặc mật khẩu (không nói rõ cái nào sai). API trả 401. */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
