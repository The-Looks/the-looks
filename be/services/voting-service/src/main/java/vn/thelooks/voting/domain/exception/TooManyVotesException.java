package vn.thelooks.voting.domain.exception;

/** Quá nhiều phiếu từ cùng một mạng (xoá cookie / tab ẩn danh để bình chọn lại). API trả 429. */
public class TooManyVotesException extends RuntimeException {

    public TooManyVotesException(String message) {
        super(message);
    }
}
