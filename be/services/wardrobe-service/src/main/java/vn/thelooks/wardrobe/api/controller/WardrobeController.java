package vn.thelooks.wardrobe.api.controller;

import jakarta.validation.Valid;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.time.Duration;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import vn.thelooks.security.CurrentUser;
import vn.thelooks.wardrobe.api.dto.AttributesRequest;
import vn.thelooks.wardrobe.api.dto.BatchItemsRequest;
import vn.thelooks.wardrobe.api.dto.ConfirmItemsRequest;
import vn.thelooks.wardrobe.api.dto.ItemResponse;
import vn.thelooks.wardrobe.api.dto.ScanResponse;
import vn.thelooks.wardrobe.application.port.out.ImageStorage;
import vn.thelooks.wardrobe.application.usecase.DeleteClothingItemUseCase;
import vn.thelooks.wardrobe.application.usecase.GetScanQuery;
import vn.thelooks.wardrobe.application.usecase.GetWardrobeQuery;
import vn.thelooks.wardrobe.application.usecase.ManageItemsInBulkUseCase;
import vn.thelooks.wardrobe.application.usecase.ReviewClothingItemUseCase;
import vn.thelooks.wardrobe.application.usecase.ScanClothingUseCase;
import vn.thelooks.wardrobe.application.usecase.ScanClothingUseCase.UploadedImage;
import vn.thelooks.wardrobe.domain.exception.ClothingItemNotFoundException;
import vn.thelooks.wardrobe.domain.exception.InvalidImageException;
import vn.thelooks.wardrobe.domain.exception.InvalidItemStateException;
import vn.thelooks.wardrobe.domain.exception.WardrobeFullException;
import vn.thelooks.wardrobe.domain.model.Category;
import vn.thelooks.wardrobe.domain.model.ClothingItem;
import vn.thelooks.wardrobe.domain.model.ItemStatus;

@RestController
@RequestMapping("/api/app/wardrobe")
class WardrobeController {

    static final Duration IMAGE_URL_TTL = Duration.ofHours(1);

    private final ScanClothingUseCase scan;
    private final GetScanQuery scans;
    private final GetWardrobeQuery wardrobe;
    private final ReviewClothingItemUseCase review;
    private final DeleteClothingItemUseCase delete;
    private final ManageItemsInBulkUseCase bulk;
    private final ImageStorage storage;

    WardrobeController(ScanClothingUseCase scan, GetScanQuery scans, GetWardrobeQuery wardrobe,
            ReviewClothingItemUseCase review, DeleteClothingItemUseCase delete, ManageItemsInBulkUseCase bulk,
            ImageStorage storage) {
        this.scan = scan;
        this.scans = scans;
        this.wardrobe = wardrobe;
        this.review = review;
        this.delete = delete;
        this.bulk = bulk;
        this.storage = storage;
    }

    @PostMapping(value = "/scans", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.ACCEPTED)
    ScanResponse startScan(@AuthenticationPrincipal Jwt jwt, @RequestPart("images") List<MultipartFile> images) {
        List<UploadedImage> uploads = images.stream().map(WardrobeController::toUpload).toList();
        var started = scan.start(CurrentUser.id(jwt), uploads);
        return new ScanResponse(started.id(), started.status(), started.imageCount(), List.of(), 0, started.createdAt());
    }

    @GetMapping("/scans/{scanId}")
    ScanResponse getScan(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID scanId) {
        var view = scans.scan(CurrentUser.id(jwt), scanId)
                .orElseThrow(() -> new ClothingItemNotFoundException("Không tìm thấy lần quét"));
        var s = view.scan();
        return new ScanResponse(s.id(), s.status(), s.imageCount(), view.items().stream().map(this::response).toList(),
                s.skippedForLimit(), s.createdAt());
    }

    @GetMapping("/items")
    List<ItemResponse> list(@AuthenticationPrincipal Jwt jwt, @RequestParam(required = false) ItemStatus status,
            @RequestParam(required = false) Category category) {
        return wardrobe.list(CurrentUser.id(jwt), new GetWardrobeQuery.Filter(status, category)).stream()
                .map(this::response).toList();
    }

    @GetMapping("/items/{itemId}")
    ItemResponse get(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID itemId) {
        return response(wardrobe.get(CurrentUser.id(jwt), itemId)
                .orElseThrow(() -> new ClothingItemNotFoundException("Không tìm thấy món đồ")));
    }

    @PostMapping("/items/{itemId}/confirm")
    ItemResponse confirm(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID itemId,
            @Valid @RequestBody AttributesRequest body) {
        return response(review.confirm(CurrentUser.id(jwt), itemId, body.toDomain()));
    }

    @PostMapping("/items/confirm")
    List<ItemResponse> confirmAll(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ConfirmItemsRequest body) {
        var confirmations = body.items().stream()
                .map(i -> new ReviewClothingItemUseCase.Confirmation(i.itemId(), i.attributes().toDomain())).toList();
        return review.confirmAll(CurrentUser.id(jwt), confirmations).stream().map(this::response).toList();
    }

    @PutMapping("/items/{itemId}")
    ItemResponse update(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID itemId,
            @Valid @RequestBody AttributesRequest body) {
        return response(review.update(CurrentUser.id(jwt), itemId, body.toDomain()));
    }

    @DeleteMapping("/items/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void remove(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID itemId) {
        delete.delete(CurrentUser.id(jwt), itemId);
    }

    @PatchMapping("/items/batch")
    List<ItemResponse> changeStatus(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody BatchItemsRequest body) {
        return bulk.changeStatus(CurrentUser.id(jwt), body.itemIds(), body.status()).stream().map(this::response).toList();
    }

    @PostMapping("/items/batch-delete")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void removeAll(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody BatchItemsRequest body) {
        bulk.deleteAll(CurrentUser.id(jwt), body.itemIds());
    }

    private ItemResponse response(ClothingItem item) {
        URI url = storage.url(item.imageKey(), IMAGE_URL_TTL);
        return ItemResponse.from(item, url);
    }

    private static UploadedImage toUpload(MultipartFile f) {
        try {
            return new UploadedImage(f.getBytes(), f.getContentType());
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    @ExceptionHandler(InvalidImageException.class)
    ProblemDetail badImage(InvalidImageException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    @ExceptionHandler(WardrobeFullException.class)
    ProblemDetail full(WardrobeFullException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, e.getMessage());
    }

    @ExceptionHandler(ClothingItemNotFoundException.class)
    ProblemDetail notFound(ClothingItemNotFoundException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(InvalidItemStateException.class)
    ProblemDetail conflict(InvalidItemStateException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, e.getMessage());
    }
}
