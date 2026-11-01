package vn.thelooks.identity.application.usecase;

public interface SessionUseCase {

    LoginUseCase.AuthTokens refresh(String refreshToken);

    void logout(String refreshToken);
}
