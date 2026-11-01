package vn.thelooks.identity.application.usecase;

import java.net.URI;

public interface GoogleLoginUseCase {

    Start start();

    LoginUseCase.AuthTokens complete(String code, String state, String stateCookie);

    record Start(String state, URI authorizationUri) {
    }
}
