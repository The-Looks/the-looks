package vn.thelooks.auth.presentation.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.auth.application.port.in.DeleteUserAccountUseCase;
import vn.thelooks.auth.domain.model.AccountDeletionJob;
import vn.thelooks.security.CurrentUser;

@RestController
@RequestMapping("/api/app/me/deletion")
class SelfAccountDeletionController {
    private final DeleteUserAccountUseCase deletions;
    SelfAccountDeletionController(DeleteUserAccountUseCase deletions) { this.deletions = deletions; }

    @PostMapping
    ResponseEntity<AccountDeletionJob> delete(@AuthenticationPrincipal Jwt jwt, HttpServletRequest request) {
        var userId = CurrentUser.id(jwt);
        var job = deletions.startOrRetry(userId, userId);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, AuthCookies.clearAccess(request).toString())
                .header(HttpHeaders.SET_COOKIE, AuthCookies.clearRefresh(request).toString())
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(job);
    }
}
