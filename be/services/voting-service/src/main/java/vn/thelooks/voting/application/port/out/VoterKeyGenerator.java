package vn.thelooks.voting.application.port.out;

public interface VoterKeyGenerator {

    String forPoll(String code, String voterId);
}
