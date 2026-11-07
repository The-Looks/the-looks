package vn.thelooks.outfit.api.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.outfit.application.port.in.ManageOutfitUserDataUseCase;
import vn.thelooks.outfit.domain.model.AdminOutfitSummary;

@RestController
@RequestMapping("/api/admin/outfits/users")
class AdminOutfitUserController {
    private final ManageOutfitUserDataUseCase useCase;
    AdminOutfitUserController(ManageOutfitUserDataUseCase useCase) { this.useCase = useCase; }

    @GetMapping("/{id}/data")
    @PreAuthorize("hasAuthority('PERMISSION_USER_MANAGE')")
    AdminOutfitSummary summary(@PathVariable UUID id) { return useCase.summary(id); }

    @DeleteMapping("/{id}/data")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@accountDeletionAuthorization.canDelete(authentication, #p0)")
    void delete(@PathVariable UUID id) { useCase.delete(id); }
}
