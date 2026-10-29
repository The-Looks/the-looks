package vn.thelooks.outfit.api.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.outfit.api.dto.OutfitDetailResponse;
import vn.thelooks.outfit.api.dto.OutfitResponse;
import vn.thelooks.outfit.api.dto.SaveOutfitRequest;
import vn.thelooks.outfit.api.dto.SuggestionResponse;
import vn.thelooks.outfit.application.port.out.WardrobeUnavailableException;
import vn.thelooks.outfit.application.usecase.GetOutfitsQuery;
import vn.thelooks.outfit.application.usecase.MarkOutfitWornUseCase;
import vn.thelooks.outfit.application.usecase.QuickPickUseCase;
import vn.thelooks.outfit.application.usecase.SaveOutfitUseCase;
import vn.thelooks.outfit.application.usecase.SuggestOutfitsUseCase;
import vn.thelooks.outfit.domain.exception.InvalidOutfitException;
import vn.thelooks.outfit.domain.exception.OutfitNotFoundException;
import vn.thelooks.outfit.domain.model.Occasion;
import vn.thelooks.security.CurrentUser;

@RestController
@RequestMapping("/api/app/outfits")
class OutfitController {

    private final SuggestOutfitsUseCase suggestOutfits;
    private final QuickPickUseCase quickPick;
    private final SaveOutfitUseCase saveOutfit;
    private final MarkOutfitWornUseCase markOutfitWorn;
    private final GetOutfitsQuery getOutfits;

    OutfitController(SuggestOutfitsUseCase suggestOutfits, QuickPickUseCase quickPick, SaveOutfitUseCase saveOutfit,
            MarkOutfitWornUseCase markOutfitWorn, GetOutfitsQuery getOutfits) {
        this.suggestOutfits = suggestOutfits;
        this.quickPick = quickPick;
        this.saveOutfit = saveOutfit;
        this.markOutfitWorn = markOutfitWorn;
        this.getOutfits = getOutfits;
    }

    /** AI gợi ý theo dịp. */
    @GetMapping("/suggestions")
    List<SuggestionResponse> suggest(@AuthenticationPrincipal Jwt jwt, @RequestParam Occasion occasion,
            @RequestParam(defaultValue = "3") @Min(1) @Max(10) int limit) {
        return suggestOutfits.suggest(CurrentUser.id(jwt), occasion, limit).stream().map(SuggestionResponse::from).toList();
    }

    /** Quick Pick: 204 khi tủ đồ chưa đủ món để phối. */
    @GetMapping("/quick-pick")
    ResponseEntity<SuggestionResponse> quickPick(@AuthenticationPrincipal Jwt jwt) {
        return quickPick.quickPick(CurrentUser.id(jwt))
                .map(s -> ResponseEntity.ok(SuggestionResponse.from(s)))
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    OutfitResponse save(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody SaveOutfitRequest request) {
        return OutfitResponse.from(saveOutfit.save(CurrentUser.id(jwt), request.itemIds(), request.occasion()));
    }

    @GetMapping
    List<OutfitResponse> mine(@AuthenticationPrincipal Jwt jwt) {
        return getOutfits.mine(CurrentUser.id(jwt)).stream().map(OutfitResponse::from).toList();
    }

    /** Outfit kèm ảnh, voting-service gọi khi tạo bình chọn. */
    @GetMapping("/{outfitId}")
    OutfitDetailResponse detail(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID outfitId) {
        return getOutfits.view(CurrentUser.id(jwt), outfitId)
                .map(OutfitDetailResponse::from)
                .orElseThrow(() -> new OutfitNotFoundException("Không tìm thấy outfit"));
    }

    /** Nút "Mặc bộ này". */
    @PostMapping("/{outfitId}/wear")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void wear(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID outfitId) {
        markOutfitWorn.markWorn(CurrentUser.id(jwt), outfitId);
    }

    @ExceptionHandler(OutfitNotFoundException.class)
    ProblemDetail notFound(OutfitNotFoundException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(InvalidOutfitException.class)
    ProblemDetail badRequest(InvalidOutfitException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    @ExceptionHandler(WardrobeUnavailableException.class)
    ProblemDetail wardrobeUnavailable(WardrobeUnavailableException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE, e.getMessage());
    }
}
