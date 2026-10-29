package vn.thelooks.voting.domain.exception;

/** Link bình chọn đã hết hạn. API trả 410. */
public class PollExpiredException extends RuntimeException {

    public PollExpiredException(String message) {
        super(message);
    }
}
