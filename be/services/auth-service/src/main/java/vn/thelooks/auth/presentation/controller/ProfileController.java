package vn.thelooks.auth.presentation.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import vn.thelooks.auth.application.port.in.ManageProfileUseCase;
import vn.thelooks.auth.domain.model.UserProfile;
import vn.thelooks.security.CurrentUser;

@RestController
@RequestMapping("/api/app/me")
@PreAuthorize("hasAuthority('PERMISSION_ACCOUNT_READ_SELF')")
class ProfileController {
    private final ManageProfileUseCase profiles;
    ProfileController(ManageProfileUseCase profiles) { this.profiles = profiles; }

    record UpdateProfile(@NotBlank @Size(max=60) String username, @Size(max=120) String city) {}

    @GetMapping("/profile")
    UserProfile get(@AuthenticationPrincipal Jwt jwt) { return profiles.get(CurrentUser.id(jwt)); }

    @PutMapping("/profile")
    UserProfile update(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody UpdateProfile request) {
        return profiles.update(CurrentUser.id(jwt), request.username(), request.city());
    }

    @GetMapping("/avatar")
    ResponseEntity<byte[]> avatar(@AuthenticationPrincipal Jwt jwt) {
        var avatar = profiles.avatar(CurrentUser.id(jwt));
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).contentType(MediaType.parseMediaType(avatar.contentType()))
                .body(avatar.bytes());
    }

    @PostMapping(value="/avatar", consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    UserProfile uploadAvatar(@AuthenticationPrincipal Jwt jwt, @RequestPart("file") MultipartFile file) throws java.io.IOException {
        return profiles.uploadAvatar(CurrentUser.id(jwt), file.getBytes());
    }

    @DeleteMapping("/avatar")
    UserProfile removeAvatar(@AuthenticationPrincipal Jwt jwt) { return profiles.removeAvatar(CurrentUser.id(jwt)); }
}
