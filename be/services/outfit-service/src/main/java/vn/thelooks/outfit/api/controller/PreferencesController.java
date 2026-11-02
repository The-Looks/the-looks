package vn.thelooks.outfit.api.controller;

import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.outfit.application.usecase.StylePreferencesUseCase;
import vn.thelooks.outfit.domain.model.StylePreferences;
import vn.thelooks.outfit.domain.model.StylePreferences.Budget;
import vn.thelooks.outfit.domain.model.StylePreferences.Gender;
import vn.thelooks.security.CurrentUser;

/** Hồ sơ phong cách: onboarding và trang Cá nhân. */
@RestController
@RequestMapping("/api/app/outfits/preferences")
class PreferencesController {

    private final StylePreferencesUseCase preferences;

    PreferencesController(StylePreferencesUseCase preferences) {
        this.preferences = preferences;
    }

    @GetMapping
    Body get(@AuthenticationPrincipal Jwt jwt) {
        return Body.from(preferences.preferences(CurrentUser.id(jwt)));
    }

    @PutMapping
    Body save(@AuthenticationPrincipal Jwt jwt, @RequestBody Body body) {
        return Body.from(preferences.save(CurrentUser.id(jwt), new StylePreferences(body.gender(), body.styles(), body.budget())));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ProblemDetail badRequest(IllegalArgumentException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    record Body(Gender gender, Set<String> styles, Budget budget) {

        static Body from(StylePreferences p) {
            return new Body(p.gender(), p.styles(), p.budget());
        }
    }
}
