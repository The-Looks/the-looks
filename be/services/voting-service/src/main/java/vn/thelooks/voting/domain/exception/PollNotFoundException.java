package vn.thelooks.voting.domain.exception;

/** Không có bình chọn với mã này. API trả 404. */
public class PollNotFoundException extends RuntimeException {

    public PollNotFoundException(String message) {
        super(message);
    }
}
