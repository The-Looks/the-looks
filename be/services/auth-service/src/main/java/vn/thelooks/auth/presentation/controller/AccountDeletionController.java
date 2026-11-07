package vn.thelooks.auth.presentation.controller;

import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.auth.application.port.in.DeleteUserAccountUseCase;
import vn.thelooks.auth.application.port.in.RecordAdminFailureUseCase;
import vn.thelooks.auth.domain.model.AccountDeletionJob;
import vn.thelooks.security.CurrentUser;

@RestController
@RequestMapping("/api/admin/auth/users/{id}/deletion")
class AccountDeletionController {
    private final DeleteUserAccountUseCase operations;
    private final RecordAdminFailureUseCase failures;
    AccountDeletionController(DeleteUserAccountUseCase operations, RecordAdminFailureUseCase failures) {
        this.operations=operations;
        this.failures=failures;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PERMISSION_USER_DELETE')")
    AccountDeletionJob get(@PathVariable UUID id) { return operations.get(id); }

    @PostMapping
    @PreAuthorize("hasAuthority('PERMISSION_USER_DELETE')")
    AccountDeletionJob start(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID id) {
        try {
            return operations.startOrRetry(CurrentUser.id(jwt),id);
        } catch (RuntimeException failure) {
            failures.record(CurrentUser.id(jwt), id.toString(), "USER_DELETE_REQUESTED", failure);
            throw failure;
        }
    }
}
