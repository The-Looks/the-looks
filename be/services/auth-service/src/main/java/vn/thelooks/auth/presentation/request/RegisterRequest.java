package vn.thelooks.auth.presentation.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import vn.thelooks.auth.domain.model.PasswordPolicy;

public record RegisterRequest(@NotBlank @Email String email, @NotBlank @Size(min = PasswordPolicy.MIN_LENGTH) String password,
        @NotBlank @Size(max = 60) String username,
        @AssertTrue(message = "Cần đồng ý Điều khoản sử dụng và Chính sách quyền riêng tư") boolean acceptedTerms) {
}
