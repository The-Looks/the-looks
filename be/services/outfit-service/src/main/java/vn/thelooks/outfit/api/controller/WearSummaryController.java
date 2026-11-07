package vn.thelooks.outfit.api.controller;

import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.security.CurrentUser;
import vn.thelooks.outfit.application.usecase.GetWearSummaryQuery;

@RestController
class WearSummaryController {
    private final GetWearSummaryQuery query;
    WearSummaryController(GetWearSummaryQuery query) { this.query = query; }
    @GetMapping("/api/app/outfits/wear-summary")
    List<GetWearSummaryQuery.ItemWear> summary(@AuthenticationPrincipal Jwt jwt) { return query.summary(CurrentUser.id(jwt)); }
}
