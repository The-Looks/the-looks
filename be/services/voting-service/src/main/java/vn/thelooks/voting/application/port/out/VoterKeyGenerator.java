package vn.thelooks.voting.application.port.out;

public interface VoterKeyGenerator {

    String forPoll(String code, String voterId);

    /** Hash của IP gắn với từng poll: không lưu IP gốc, không nối được một người qua nhiều poll. */
    String forIp(String code, String ip);
}
