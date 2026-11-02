package vn.thelooks.voting.api.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.net.URI;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.security.CurrentUser;
import vn.thelooks.voting.api.dto.PollResponse;
import vn.thelooks.voting.application.port.out.OutfitUnavailableException;
import vn.thelooks.voting.application.port.out.VoterKeyGenerator;
import vn.thelooks.voting.application.usecase.CastVoteUseCase;
import vn.thelooks.voting.application.usecase.CreatePollUseCase;
import vn.thelooks.voting.application.usecase.GetPollQuery;
import vn.thelooks.voting.domain.exception.AlreadyVotedException;
import vn.thelooks.voting.domain.exception.InvalidPollException;
import vn.thelooks.voting.domain.exception.PollExpiredException;
import vn.thelooks.voting.domain.exception.PollNotFoundException;
import vn.thelooks.voting.domain.model.Choice;

@RestController
@RequestMapping("/api")
class PollController {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final CreatePollUseCase createPoll;
    private final CastVoteUseCase castVote;
    private final GetPollQuery getPoll;
    private final VoterKeyGenerator voterKeys;

    PollController(CreatePollUseCase createPoll, CastVoteUseCase castVote, GetPollQuery getPoll,
            VoterKeyGenerator voterKeys) {
        this.createPoll = createPoll;
        this.castVote = castVote;
        this.getPoll = getPoll;
        this.voterKeys = voterKeys;
    }

    @GetMapping("/app/polls")
    List<PollResponse> mine(@AuthenticationPrincipal Jwt jwt) {
        return getPoll.mine(CurrentUser.id(jwt)).stream()
                .map(poll -> PollResponse.from(poll, getPoll.result(poll.code())))
                .toList();
    }

    @PostMapping("/app/polls")
    ResponseEntity<CreatedPollResponse> create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CreatePollRequest body) {
        var created = createPoll.create(new CreatePollUseCase.CreatePollCommand(
                CurrentUser.id(jwt), body.outfitAId(), body.outfitBId(), body.question(),
                Duration.ofHours(body.ttlHours() == null ? 24 : body.ttlHours())));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new CreatedPollResponse(created.code(), created.shareUrl(), created.expiresAt()));
    }

    @GetMapping("/public/polls/{code}")
    PollResponse publicPoll(@PathVariable String code) {
        var poll = getPoll.byCode(code).orElseThrow(() -> new PollNotFoundException("Không tìm thấy bình chọn"));
        return PollResponse.from(poll, getPoll.result(code));
    }

    @PostMapping("/public/polls/{code}/votes")
    ResponseEntity<PollResponse.Result> vote(@PathVariable String code, @Valid @RequestBody VoteRequest body,
            @CookieValue(name = "vote_id", required = false) String voterId, HttpServletRequest request) {
        var id = voterId != null && voterId.matches("[A-Za-z0-9_-]{43}") ? voterId : newVoterId();
        var result = castVote.vote(code, body.choice(), voterKeys.forPoll(code, id));
        var cookie = ResponseCookie.from("vote_id", id)
                .httpOnly(true).secure(request.isSecure()).sameSite("Lax")
                .path("/api/public/polls").maxAge(Duration.ofDays(365)).build();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(PollResponse.Result.from(result));
    }

    private static String newVoterId() {
        var bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    record CreatePollRequest(@NotNull UUID outfitAId, @NotNull UUID outfitBId,
            @Size(max = 140) String question, @Min(1) @Max(168) Integer ttlHours) {
    }

    record CreatedPollResponse(String code, URI shareUrl, Instant expiresAt) {
    }

    record VoteRequest(@NotNull Choice choice) {
    }

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
