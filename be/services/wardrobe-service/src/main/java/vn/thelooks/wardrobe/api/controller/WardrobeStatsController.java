package vn.thelooks.wardrobe.api.controller;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.CacheControl;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.security.CurrentUser;
import vn.thelooks.wardrobe.api.dto.ItemResponse;
import vn.thelooks.wardrobe.application.port.out.ImageStorage;
import vn.thelooks.wardrobe.application.port.out.StatsAccessUnavailableException;
import vn.thelooks.wardrobe.application.port.out.WardrobeStatsAccessDeniedException;
import vn.thelooks.wardrobe.application.port.out.WearHistoryUnavailableException;
import vn.thelooks.wardrobe.application.usecase.GetWardrobeStatsQuery;

@RestController
class WardrobeStatsController {
    record UnusedItemResponse(ItemResponse item, Instant lastWornAt, Long daysSinceWear) {}
    record StatsResponse(long totalItems, long wornItems, long neverWornItems, double wearRatePercent,
            List<GetWardrobeStatsQuery.Count> byCategory, List<GetWardrobeStatsQuery.Count> byColor,
            long inactiveCount, int inactiveAfterDays, List<UnusedItemResponse> unusedItems, Instant asOf) {}
    private final GetWardrobeStatsQuery stats;
    private final ImageStorage images;
    WardrobeStatsController(GetWardrobeStatsQuery stats, ImageStorage images) { this.stats = stats; this.images = images; }
    @GetMapping("/api/app/wardrobe/stats")
    ResponseEntity<StatsResponse> stats(@AuthenticationPrincipal Jwt jwt) {
        var s = stats.stats(CurrentUser.id(jwt));
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(new StatsResponse(s.totalItems(), s.wornItems(), s.neverWornItems(), s.wearRatePercent(), s.byCategory(), s.byColor(),
                s.inactiveCount(), s.inactiveAfterDays(), s.unusedItems().stream().map(i -> new UnusedItemResponse(
                        ItemResponse.from(i.item(), images.url(i.item().imageKey(), Duration.ofHours(1))), i.lastWornAt(), i.daysSinceWear())).toList(), s.asOf()));
    }
    @ExceptionHandler(WardrobeStatsAccessDeniedException.class)
    ProblemDetail denied(WardrobeStatsAccessDeniedException e) { return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, e.getMessage()); }
    @ExceptionHandler({StatsAccessUnavailableException.class, WearHistoryUnavailableException.class})
    ProblemDetail unavailable(RuntimeException e) { return ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE, e.getMessage()); }
}
