package vn.thelooks.auth.presentation.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.auth.application.port.in.SetPasswordUseCase;
import vn.thelooks.security.CurrentUser;

@RestController
@RequestMapping("/api/app/me")
class PasswordSetupController {
    record AuthMethods(boolean hasPassword) {}
    record SetPassword(String password) {}
    private final SetPasswordUseCase passwords;
    PasswordSetupController(SetPasswordUseCase passwords) { this.passwords = passwords; }

    @GetMapping("/auth-methods")
    AuthMethods methods(@AuthenticationPrincipal Jwt jwt) {
        return new AuthMethods(passwords.hasPassword(CurrentUser.id(jwt)));
    }

    @PostMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void setup(@AuthenticationPrincipal Jwt jwt, @RequestBody SetPassword body) {
        passwords.setup(CurrentUser.id(jwt), UUID.fromString(jwt.getClaimAsString("sid")), body.password());
    }
}
