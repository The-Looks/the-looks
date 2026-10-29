package vn.thelooks.voting.domain.model;

public record PollResult(long votesA, long votesB) {

    public long total() {
        return votesA + votesB;
    }

    /** 0..100, làm tròn; 0 khi chưa có lượt nào. */
    public int percentA() {
        return total() == 0 ? 0 : (int) Math.round(votesA * 100.0 / total());
    }

    public int percentB() {
        return total() == 0 ? 0 : 100 - percentA();
    }
}
