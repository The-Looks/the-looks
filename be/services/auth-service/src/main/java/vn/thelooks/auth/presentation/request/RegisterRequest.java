package vn.thelooks.auth.presentation.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import vn.thelooks.auth.domain.model.PasswordPolicy;

public record RegisterRequest(@NotBlank @Email String email, @NotBlank @Size(min = PasswordPolicy.MIN_LENGTH) String password,
        @NotBlank @Size(max = 60) String username) {
}
