package vn.thelooks.voting.application.port.in;

import vn.thelooks.voting.domain.Choice;
import vn.thelooks.voting.domain.PollResult;

/** Khách bình chọn trên voting-web, không cần đăng nhập. */
public interface CastVoteUseCase {

    /**
     * @param voterKey do web adapter tính (hash cookie + IP)
     * @return kết quả sau khi bình chọn, để hiện ngay cho khách
     */
    PollResult vote(String code, Choice choice, String voterKey);
}
