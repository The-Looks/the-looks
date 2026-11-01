package vn.thelooks.voting.application.port.in;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import vn.thelooks.voting.domain.model.Poll;
import vn.thelooks.voting.domain.model.PollResult;

public interface GetPollQuery {

    /** Cho trang công khai /v/{code}. */
    Optional<Poll> byCode(String code);

    PollResult result(String code);

    /** Danh sách bình chọn của chủ sở hữu (trên app). */
    List<Poll> mine(UUID ownerId);
}
