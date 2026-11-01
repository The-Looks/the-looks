package vn.thelooks.voting.application.port.in;

import vn.thelooks.voting.domain.enums.Choice;
import vn.thelooks.voting.domain.model.PollResult;

/** Khách bình chọn trên voting-web, không cần đăng nhập. */
public interface CastVoteUseCase {

    /**
     * @param voterKey do web adapter tính từ cookie và mã poll
     * @return kết quả sau khi bình chọn, để hiện ngay cho khách
     */
    PollResult vote(String code, Choice choice, String voterKey);
}
