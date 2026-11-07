package vn.thelooks.wardrobe.api.controller;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.UUID;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import vn.thelooks.security.CurrentUser;
import vn.thelooks.wardrobe.api.dto.ItemResponse;
import vn.thelooks.wardrobe.application.port.out.*;
import vn.thelooks.wardrobe.application.usecase.GetCostPerWearQuery;
import vn.thelooks.wardrobe.domain.exception.ClothingItemNotFoundException;
import vn.thelooks.wardrobe.domain.exception.InvalidItemStateException;
import vn.thelooks.wardrobe.domain.model.CostPerWear;

@RestController
class CostPerWearController {
    record CostResponse(ItemResponse item, long wearCount, BigDecimal costPerWear, CostPerWear.Status status) {}
    record SummaryResponse(List<CostResponse> items, long totalItems) {}
    private final GetCostPerWearQuery query;
    private final ImageStorage images;
    CostPerWearController(GetCostPerWearQuery query, ImageStorage images) { this.query = query; this.images = images; }
    @GetMapping("/api/app/wardrobe/items/{itemId}/cost-per-wear")
    ResponseEntity<CostResponse> item(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID itemId) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(response(query.item(CurrentUser.id(jwt), itemId)));
    }
    @GetMapping("/api/app/wardrobe/cost-per-wear")
    ResponseEntity<SummaryResponse> summary(@AuthenticationPrincipal Jwt jwt) {
        var s = query.summary(CurrentUser.id(jwt));
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(new SummaryResponse(s.items().stream().map(this::response).toList(), s.totalItems()));
    }
    private CostResponse response(GetCostPerWearQuery.Entry e) {
        return new CostResponse(ItemResponse.from(e.item(), images.url(e.item().imageKey(), Duration.ofHours(1))), e.cost().wearCount(), e.cost().amount(), e.cost().status());
    }
    @ExceptionHandler(CostPerWearAccessDeniedException.class)
    ProblemDetail denied(CostPerWearAccessDeniedException e) { return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, e.getMessage()); }
    @ExceptionHandler({WearHistoryUnavailableException.class, StatsAccessUnavailableException.class})
    ProblemDetail unavailable(RuntimeException e) { return ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE, e.getMessage()); }
    @ExceptionHandler(ClothingItemNotFoundException.class)
    ProblemDetail missing(ClothingItemNotFoundException e) { return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage()); }
    @ExceptionHandler(InvalidItemStateException.class)
    ProblemDetail conflict(InvalidItemStateException e) { return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, e.getMessage()); }
}
