package vn.thelooks.outfit.adapter.in.web;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;
import java.util.NoSuchElementException;
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
import vn.thelooks.outfit.adapter.in.web.OutfitDtos.OutfitResponse;
import vn.thelooks.outfit.adapter.in.web.OutfitDtos.SaveOutfitRequest;
import vn.thelooks.outfit.adapter.in.web.OutfitDtos.SuggestionResponse;
import vn.thelooks.outfit.application.port.in.GetOutfitsQuery;
import vn.thelooks.outfit.application.port.in.MarkOutfitWornUseCase;
import vn.thelooks.outfit.application.port.in.QuickPickUseCase;
import vn.thelooks.outfit.application.port.in.SaveOutfitUseCase;
import vn.thelooks.outfit.application.port.in.SuggestOutfitsUseCase;
import vn.thelooks.outfit.domain.Occasion;

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
        return suggestOutfits.suggest(ownerId(jwt), occasion, limit).stream().map(SuggestionResponse::from).toList();
    }

    /** Quick Pick: 204 khi tủ đồ chưa đủ món để phối. */
    @GetMapping("/quick-pick")
    ResponseEntity<SuggestionResponse> quickPick(@AuthenticationPrincipal Jwt jwt) {
        return quickPick.quickPick(ownerId(jwt))
                .map(s -> ResponseEntity.ok(SuggestionResponse.from(s)))
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    OutfitResponse save(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody SaveOutfitRequest request) {
        return OutfitResponse.from(saveOutfit.save(ownerId(jwt), request.itemIds(), request.occasion()));
    }

    @GetMapping
    List<OutfitResponse> mine(@AuthenticationPrincipal Jwt jwt) {
        return getOutfits.mine(ownerId(jwt)).stream().map(OutfitResponse::from).toList();
    }

    /** Nút "Mặc bộ này". */
    @PostMapping("/{outfitId}/wear")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void wear(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID outfitId) {
        markOutfitWorn.markWorn(ownerId(jwt), outfitId);
    }

    @ExceptionHandler(NoSuchElementException.class)
    ProblemDetail notFound(NoSuchElementException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ProblemDetail badRequest(IllegalArgumentException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    /** JWT do module identity phát, claim sub = userId. */
    private static UUID ownerId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
