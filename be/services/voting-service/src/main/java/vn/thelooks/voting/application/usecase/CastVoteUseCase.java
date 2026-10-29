package vn.thelooks.voting.application.usecase;

import vn.thelooks.voting.domain.model.Choice;
import vn.thelooks.voting.domain.model.PollResult;

/** Khách bình chọn trên voting-web, không cần đăng nhập. */
public interface CastVoteUseCase {

    /**
     * @param voterKey do web adapter tính (hash cookie + IP)
     * @return kết quả sau khi bình chọn, để hiện ngay cho khách
     */
    PollResult vote(String code, Choice choice, String voterKey);
}
