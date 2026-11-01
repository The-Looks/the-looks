package vn.thelooks.auth.presentation.advice;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import vn.thelooks.auth.domain.exception.InvalidCredentialsException;
import vn.thelooks.auth.domain.exception.UserAlreadyExistsException;

@RestControllerAdvice
class AuthExceptionHandler {

    @ExceptionHandler(InvalidCredentialsException.class)
    ProblemDetail unauthorized(InvalidCredentialsException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, e.getMessage());
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    ProblemDetail conflict(UserAlreadyExistsException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, e.getMessage());
    }

    @ExceptionHandler(ForbiddenOriginException.class)
    ProblemDetail forbidden(ForbiddenOriginException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Nguồn yêu cầu không được phép");
    }
}
