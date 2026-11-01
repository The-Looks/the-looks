package vn.thelooks.voting.domain.exception;

public class InvalidPollException extends RuntimeException {

    public InvalidPollException(String message) {
        super(message);
    }
}
