package vn.thelooks.voting.domain.exception;

/** Người này đã bình chọn rồi. API trả 409. */
public class AlreadyVotedException extends RuntimeException {

    public AlreadyVotedException(String message) {
        super(message);
    }
}
