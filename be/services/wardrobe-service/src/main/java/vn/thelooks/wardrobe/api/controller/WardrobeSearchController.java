package vn.thelooks.wardrobe.api.controller;

import java.time.Duration;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.security.CurrentUser;
import vn.thelooks.wardrobe.api.dto.ItemResponse;
import vn.thelooks.wardrobe.application.port.out.ImageStorage;
import vn.thelooks.wardrobe.application.port.out.WearHistoryUnavailableException;
import vn.thelooks.wardrobe.application.usecase.SearchWardrobeQuery;
import vn.thelooks.wardrobe.application.usecase.SearchWardrobeQuery.Filter;
import vn.thelooks.wardrobe.application.usecase.SearchWardrobeQuery.Sort;
import vn.thelooks.wardrobe.domain.model.Category;
import vn.thelooks.wardrobe.domain.model.ItemStatus;
import vn.thelooks.wardrobe.domain.model.Season;

@RestController
@RequestMapping("/api/app/wardrobe/items/search")
class WardrobeSearchController {
    record PageResponse(List<ItemResponse> items, long total, int page, int size) {}
    private final SearchWardrobeQuery search;
    private final ImageStorage images;
    WardrobeSearchController(SearchWardrobeQuery search, ImageStorage images) { this.search = search; this.images = images; }

    @GetMapping
    PageResponse search(@AuthenticationPrincipal Jwt jwt, @RequestParam(required = false) ItemStatus status,
            @RequestParam(required = false) Category category, @RequestParam(required = false) String color,
            @RequestParam(required = false) Season season, @RequestParam(required = false) String style,
            @RequestParam(required = false) String q, @RequestParam(defaultValue = "NEWEST") Sort sort,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "24") int size) {
        var result = search.search(CurrentUser.id(jwt), new Filter(status, category, color, season, style, q, sort, page, size));
        return new PageResponse(result.items().stream()
                .map(i -> ItemResponse.from(i, images.url(i.imageKey(), Duration.ofHours(1)))).toList(), result.total(), page, size);
    }
    @ExceptionHandler(IllegalArgumentException.class)
    ProblemDetail invalid(IllegalArgumentException e) { return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, e.getMessage()); }
    @ExceptionHandler(WearHistoryUnavailableException.class)
    ProblemDetail unavailable(WearHistoryUnavailableException e) { return ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE, e.getMessage()); }
}
