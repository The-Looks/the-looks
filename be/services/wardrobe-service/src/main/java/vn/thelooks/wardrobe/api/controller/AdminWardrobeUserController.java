package vn.thelooks.wardrobe.api.controller;

import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import vn.thelooks.wardrobe.application.port.in.ManageWardrobeUserDataUseCase;
import vn.thelooks.wardrobe.domain.model.AdminWardrobeSummary;

@RestController
@RequestMapping("/api/admin/wardrobe/users")
class AdminWardrobeUserController {
    private final ManageWardrobeUserDataUseCase useCase;
    AdminWardrobeUserController(ManageWardrobeUserDataUseCase useCase) { this.useCase = useCase; }

    @GetMapping("/{id}/data")
    @PreAuthorize("hasAuthority('PERMISSION_USER_MANAGE')")
    AdminWardrobeSummary summary(@PathVariable UUID id) { return useCase.summary(id); }

    @DeleteMapping("/{id}/data")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('PERMISSION_USER_DELETE')")
    void delete(@PathVariable UUID id) { useCase.delete(id); }
}
