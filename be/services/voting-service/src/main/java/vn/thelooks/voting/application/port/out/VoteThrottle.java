package vn.thelooks.voting.application.port.out;

/** Giới hạn tần suất gửi phiếu theo IP (mọi poll), chặn script gửi hàng loạt. */
public interface VoteThrottle {

    /** @return false nếu IP này đã gửi quá nhiều phiếu trong khoảng thời gian gần đây */
    boolean tryAcquire(String ip);
}
