package vn.thelooks.identity.application.usecase;

import java.time.Instant;

public interface LoginUseCase {

    /** Ném lỗi nếu sai email hoặc mật khẩu (không tiết lộ cái nào sai). */
    AuthTokens login(String email, String password);

    record AuthTokens(String accessToken, Instant expiresAt, String refreshToken, Instant refreshExpiresAt) {
    }
}
