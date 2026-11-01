package vn.thelooks.auth.application.port.in;

public interface SessionUseCase {

    LoginUseCase.AuthTokens refresh(String refreshToken);

    void logout(String refreshToken);
}
