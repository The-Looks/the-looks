package vn.thelooks.voting.presentation.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.security.CurrentUser;
import vn.thelooks.voting.application.port.out.VoterKeyGenerator;
import vn.thelooks.voting.application.port.in.CastVoteUseCase;
import vn.thelooks.voting.application.port.in.CreatePollUseCase;
import vn.thelooks.voting.application.port.in.GetPollQuery;
import vn.thelooks.voting.domain.exception.PollNotFoundException;
import vn.thelooks.voting.presentation.mapper.PollResponseMapper;
import vn.thelooks.voting.presentation.request.CreatePollRequest;
import vn.thelooks.voting.presentation.request.VoteRequest;
import vn.thelooks.voting.presentation.response.CreatedPollResponse;
import vn.thelooks.voting.presentation.response.PollResponse;

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
                .map(poll -> PollResponseMapper.toResponse(poll, getPoll.result(poll.code())))
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
        return PollResponseMapper.toResponse(poll, getPoll.result(code));
    }

    @PostMapping("/public/polls/{code}/votes")
    ResponseEntity<PollResponse.Result> vote(@PathVariable String code, @Valid @RequestBody VoteRequest body,
            @CookieValue(name = "vote_id", required = false) String voterId, HttpServletRequest request) {
        var id = voterId != null && voterId.matches("[A-Za-z0-9_-]{43}") ? voterId : newVoterId();
        var result = castVote.vote(code, body.choice(), voterKeys.forPoll(code, id));
        var cookie = ResponseCookie.from("vote_id", id)
                .httpOnly(true).secure(request.isSecure()).sameSite("Lax")
                .path("/api/public/polls").maxAge(Duration.ofDays(365)).build();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(PollResponseMapper.toResult(result));
    }

    private static String newVoterId() {
        var bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

}
