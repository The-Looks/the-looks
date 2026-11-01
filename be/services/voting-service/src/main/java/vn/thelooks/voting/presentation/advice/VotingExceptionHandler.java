package vn.thelooks.voting.presentation.advice;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import vn.thelooks.voting.domain.exception.AlreadyVotedException;
import vn.thelooks.voting.domain.exception.InvalidPollException;
import vn.thelooks.voting.domain.exception.OutfitUnavailableException;
import vn.thelooks.voting.domain.exception.PollExpiredException;
import vn.thelooks.voting.domain.exception.PollNotFoundException;

@RestControllerAdvice
class VotingExceptionHandler {

    @ExceptionHandler(PollNotFoundException.class)
    ProblemDetail notFound(PollNotFoundException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(PollExpiredException.class)
    ProblemDetail expired(PollExpiredException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.GONE, e.getMessage());
    }

    @ExceptionHandler(AlreadyVotedException.class)
    ProblemDetail duplicate(AlreadyVotedException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, e.getMessage());
    }

    @ExceptionHandler(InvalidPollException.class)
    ProblemDetail invalid(InvalidPollException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    @ExceptionHandler(OutfitUnavailableException.class)
    ProblemDetail unavailable(OutfitUnavailableException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE, e.getMessage());
    }
}
