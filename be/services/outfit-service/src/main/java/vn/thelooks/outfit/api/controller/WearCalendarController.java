package vn.thelooks.outfit.api.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.outfit.application.port.out.PlanCheckUnavailableException;
import vn.thelooks.outfit.application.port.out.WearCalendarLockedException;
import vn.thelooks.outfit.application.usecase.WearCalendarUseCase;
import vn.thelooks.outfit.domain.exception.InvalidOutfitException;
import vn.thelooks.outfit.domain.exception.OutfitNotFoundException;
import vn.thelooks.security.CurrentUser;

/** Lịch mặc (Pro). Đánh dấu đã mặc dùng POST /api/app/outfits/{outfitId}/wear có sẵn. */
@RestController
@RequestMapping("/api/app/outfits/calendar")
class WearCalendarController {

    private final WearCalendarUseCase calendar;

    WearCalendarController(WearCalendarUseCase calendar) {
        this.calendar = calendar;
    }

    @GetMapping
    List<WearCalendarUseCase.Day> calendar(@AuthenticationPrincipal Jwt jwt,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return calendar.calendar(CurrentUser.id(jwt), from, to);
    }

    @PutMapping("/{date}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void plan(@AuthenticationPrincipal Jwt jwt,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Valid @RequestBody PlanRequest request) {
        calendar.plan(CurrentUser.id(jwt), date, request.outfitId());
    }

    @DeleteMapping("/{date}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void unplan(@AuthenticationPrincipal Jwt jwt,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        calendar.unplan(CurrentUser.id(jwt), date);
    }

    record PlanRequest(@NotNull UUID outfitId) {
    }

    @ExceptionHandler(WearCalendarLockedException.class)
    ProblemDetail locked(WearCalendarLockedException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, e.getMessage());
    }

    @ExceptionHandler(PlanCheckUnavailableException.class)
    ProblemDetail unavailable(PlanCheckUnavailableException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE, e.getMessage());
    }

    @ExceptionHandler(OutfitNotFoundException.class)
    ProblemDetail notFound(OutfitNotFoundException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(InvalidOutfitException.class)
    ProblemDetail badRequest(InvalidOutfitException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, e.getMessage());
    }
}
