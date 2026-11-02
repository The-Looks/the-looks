package vn.thelooks.voting.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.net.URI;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.thelooks.voting.application.port.in.CreatePollUseCase.CreatePollCommand;
import vn.thelooks.voting.application.port.out.BallotRepository;
import vn.thelooks.voting.application.port.out.OutfitReader;
import vn.thelooks.voting.application.port.out.PollRepository;
import vn.thelooks.voting.application.port.out.VoteThrottle;
import vn.thelooks.voting.application.port.out.VoterKeyGenerator;
import vn.thelooks.voting.domain.enums.Choice;
import vn.thelooks.voting.domain.exception.AlreadyVotedException;
import vn.thelooks.voting.domain.exception.InvalidPollException;
import vn.thelooks.voting.domain.exception.PollExpiredException;
import vn.thelooks.voting.domain.exception.PollNotFoundException;
import vn.thelooks.voting.domain.exception.TooManyVotesException;
import vn.thelooks.voting.domain.model.Ballot;
import vn.thelooks.voting.domain.model.Poll;
import vn.thelooks.voting.domain.model.PollOption;
import vn.thelooks.voting.domain.model.PollResult;

/** Luồng bình chọn với các port giả trong bộ nhớ. */
class VotingServiceTest {

    static final Instant NOW = Instant.parse("2026-11-01T03:00:00Z");
    static final UUID OWNER = UUID.randomUUID();
    static final UUID OUTFIT_A = UUID.randomUUID(), OUTFIT_B = UUID.randomUUID();

    Instant now = NOW;
    boolean throttleAllows = true;
    final List<Poll> polls = new ArrayList<>();
    final List<Ballot> ballots = new ArrayList<>();

    final VotingService service = new VotingService(new Polls(), new Ballots(),
            (OutfitReader) (owner, outfitId) -> owner.equals(OWNER) && (outfitId.equals(OUTFIT_A) || outfitId.equals(OUTFIT_B))
                    ? Optional.of(new PollOption(outfitId, List.of(URI.create("http://img/" + outfitId))))
                    : Optional.empty(),
            new Clock() {
                public java.time.ZoneId getZone() { return ZoneOffset.UTC; }
                public Clock withZone(java.time.ZoneId z) { return this; }
                public Instant instant() { return now; }
            },
            new VoterKeyGenerator() {
                public String forPoll(String code, String voterId) { return code + ":" + voterId; }
                public String forIp(String code, String ip) { return code + ":ip:" + ip; }
            },
            (VoteThrottle) ip -> throttleAllows,
            "http://localhost:5173/");

    String newPoll(int ttlHours) {
        return service.create(new CreatePollCommand(OWNER, OUTFIT_A, OUTFIT_B, "Đi hẹn hò mặc bộ nào?",
                Duration.ofHours(ttlHours))).code();
    }

    @Test
    void createsShareableLinkWithHardToGuessCode() {
        var created = service.create(new CreatePollCommand(OWNER, OUTFIT_A, OUTFIT_B, null, Duration.ofHours(24)));
        assertThat(created.code()).hasSize(24).matches("[A-Za-z0-9_-]+");
        assertThat(created.shareUrl().toString()).isEqualTo("http://localhost:5173/v/" + created.code());
        assertThat(created.expiresAt()).isEqualTo(NOW.plus(Duration.ofHours(24)));
    }

    @Test
    void rejectsInvalidPolls() {
        assertThatThrownBy(() -> service.create(new CreatePollCommand(OWNER, OUTFIT_A, OUTFIT_A, null, Duration.ofHours(1))))
                .isInstanceOf(InvalidPollException.class);
        assertThatThrownBy(() -> newPoll(0)).isInstanceOf(InvalidPollException.class);
        assertThatThrownBy(() -> newPoll(169)).isInstanceOf(InvalidPollException.class);
        assertThatThrownBy(() -> service.create(new CreatePollCommand(UUID.randomUUID(), OUTFIT_A, OUTFIT_B, null, Duration.ofHours(1))))
                .isInstanceOf(InvalidPollException.class); // outfit không thuộc người tạo
    }

    @Test
    void countsVotesAndBlocksTheSameVoterTwice() {
        String code = newPoll(24);
        service.vote(code, Choice.A, "v1", "1.1.1.1");
        service.vote(code, Choice.A, "v2", "1.1.1.1");
        PollResult result = service.vote(code, Choice.B, "v3", "2.2.2.2");
        assertThat(result.votesA()).isEqualTo(2);
        assertThat(result.votesB()).isEqualTo(1);
        assertThatThrownBy(() -> service.vote(code, Choice.B, "v1", "3.3.3.3")).isInstanceOf(AlreadyVotedException.class);
    }

    @Test
    void expiredAndUnknownPolls() {
        String code = newPoll(1);
        now = NOW.plus(Duration.ofHours(2));
        assertThatThrownBy(() -> service.vote(code, Choice.A, "v1", "1.1.1.1")).isInstanceOf(PollExpiredException.class);
        assertThatThrownBy(() -> service.vote("nope", Choice.A, "v1", "1.1.1.1")).isInstanceOf(PollNotFoundException.class);
    }

    @Test
    void clearingCookiesDoesNotAllowUnlimitedVotesFromOneNetwork() {
        String code = newPoll(24);
        for (int i = 0; i < VotingService.MAX_VOTES_PER_IP_PER_POLL; i++) {
            service.vote(code, Choice.A, "cookie-" + i, "9.9.9.9"); // mỗi lần một cookie mới
        }
        assertThatThrownBy(() -> service.vote(code, Choice.A, "cookie-new", "9.9.9.9")).isInstanceOf(TooManyVotesException.class);
        service.vote(code, Choice.B, "other", "8.8.8.8"); // mạng khác vẫn bình chọn được
    }

    @Test
    void throttledIpIsRejectedBeforeTouchingTheDatabase() {
        String code = newPoll(24);
        throttleAllows = false;
        assertThatThrownBy(() -> service.vote(code, Choice.A, "v1", "1.1.1.1")).isInstanceOf(TooManyVotesException.class);
        assertThat(ballots).isEmpty();
    }

    class Polls implements PollRepository {
        public Poll save(Poll poll) { polls.add(poll); return poll; }
        public Optional<Poll> findByCode(String code) { return polls.stream().filter(p -> p.code().equals(code)).findFirst(); }
        public List<Poll> findByOwner(UUID ownerId) { return polls.stream().filter(p -> p.ownerId().equals(ownerId)).toList(); }
    }

    class Ballots implements BallotRepository {
        public Ballot save(Ballot ballot) {
            if (exists(ballot.pollId(), ballot.voterKey())) throw new AlreadyVotedException("trùng");
            ballots.add(ballot);
            return ballot;
        }
        public boolean exists(UUID pollId, String voterKey) {
            return ballots.stream().anyMatch(b -> b.pollId().equals(pollId) && b.voterKey().equals(voterKey));
        }
        public long countByIp(UUID pollId, String ipKey) {
            return ballots.stream().filter(b -> b.pollId().equals(pollId) && b.ipKey().equals(ipKey)).count();
        }
        public PollResult tally(UUID pollId) {
            return new PollResult(
                    ballots.stream().filter(b -> b.pollId().equals(pollId) && b.choice() == Choice.A).count(),
                    ballots.stream().filter(b -> b.pollId().equals(pollId) && b.choice() == Choice.B).count());
        }
    }
}
