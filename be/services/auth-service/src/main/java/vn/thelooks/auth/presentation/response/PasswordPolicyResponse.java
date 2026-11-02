package vn.thelooks.auth.presentation.response;

public record PasswordPolicyResponse(int minLength, int strongLength, int recommendedCharacterTypes) {
}
