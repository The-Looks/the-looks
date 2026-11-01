package vn.thelooks.voting.application.service;

import java.net.URI;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.thelooks.voting.application.port.out.BallotRepository;
import vn.thelooks.voting.application.port.out.OutfitReader;
import vn.thelooks.voting.application.port.out.PollRepository;
import vn.thelooks.voting.application.usecase.CastVoteUseCase;
import vn.thelooks.voting.application.usecase.CreatePollUseCase;
import vn.thelooks.voting.application.usecase.GetPollQuery;
import vn.thelooks.voting.domain.exception.AlreadyVotedException;
import vn.thelooks.voting.domain.exception.InvalidPollException;
import vn.thelooks.voting.domain.exception.PollExpiredException;
import vn.thelooks.voting.domain.exception.PollNotFoundException;
import vn.thelooks.voting.domain.model.Ballot;
import vn.thelooks.voting.domain.model.Choice;
import vn.thelooks.voting.domain.model.Poll;
import vn.thelooks.voting.domain.model.PollResult;

@Service
class VotingService implements CreatePollUseCase, CastVoteUseCase, GetPollQuery {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final PollRepository polls;
    private final BallotRepository ballots;
    private final OutfitReader outfits;
    private final Clock clock;
    private final String shareBaseUrl;

    VotingService(PollRepository polls, BallotRepository ballots, OutfitReader outfits, Clock clock,
            @Value("${thelooks.voting.share-base-url}") String shareBaseUrl) {
        this.polls = polls;
        this.ballots = ballots;
        this.outfits = outfits;
        this.clock = clock;
        this.shareBaseUrl = shareBaseUrl.replaceAll("/+$", "");
    }

    @Override
    @Transactional
    public CreatedPoll create(CreatePollCommand command) {
        if (command.outfitAId().equals(command.outfitBId())) {
            throw new InvalidPollException("Chọn hai outfit khác nhau");
        }
        if (command.ttl().compareTo(Duration.ofHours(1)) < 0 || command.ttl().compareTo(Duration.ofHours(168)) > 0) {
            throw new InvalidPollException("Thời hạn bình chọn phải từ 1 đến 168 giờ");
        }
        var optionA = outfits.snapshot(command.ownerId(), command.outfitAId())
                .orElseThrow(() -> new InvalidPollException("Không tìm thấy outfit A"));
        var optionB = outfits.snapshot(command.ownerId(), command.outfitBId())
                .orElseThrow(() -> new InvalidPollException("Không tìm thấy outfit B"));
        var now = Instant.now(clock);
        var codeBytes = new byte[18];
        RANDOM.nextBytes(codeBytes);
        var code = Base64.getUrlEncoder().withoutPadding().encodeToString(codeBytes);
        var saved = polls.save(new Poll(UUID.randomUUID(), command.ownerId(), code, command.question(),
                optionA, optionB, now.plus(command.ttl()), now));
        return new CreatedPoll(code, URI.create(shareBaseUrl + "/v/" + code), saved.expiresAt());
    }

    @Override
    @Transactional
    public PollResult vote(String code, Choice choice, String voterKey) {
        var poll = polls.findByCode(code).orElseThrow(() -> new PollNotFoundException("Không tìm thấy bình chọn"));
        if (poll.isExpired(Instant.now(clock))) {
            throw new PollExpiredException("Link bình chọn đã hết hạn");
        }
        if (ballots.exists(poll.id(), voterKey)) {
            throw new AlreadyVotedException("Bạn đã bình chọn cho link này");
        }
        ballots.save(new Ballot(UUID.randomUUID(), poll.id(), choice, voterKey, Instant.now(clock)));
        return ballots.tally(poll.id());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Poll> byCode(String code) {
        return polls.findByCode(code);
    }

    @Override
    @Transactional(readOnly = true)
    public PollResult result(String code) {
        var poll = polls.findByCode(code).orElseThrow(() -> new PollNotFoundException("Không tìm thấy bình chọn"));
        return ballots.tally(poll.id());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Poll> mine(UUID ownerId) {
        return polls.findByOwner(ownerId);
    }
}
