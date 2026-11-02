package vn.thelooks.outfit.api.controller;

import java.net.URI;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.outfit.application.port.out.WardrobeUnavailableException;
import vn.thelooks.outfit.application.usecase.ShopForGapUseCase;
import vn.thelooks.outfit.domain.model.Occasion;
import vn.thelooks.outfit.domain.model.ProductOffer;
import vn.thelooks.security.CurrentUser;

/** "Gợi ý mua thêm" món tủ đồ còn thiếu, link affiliate (doanh thu luồng 2). */
@RestController
@RequestMapping("/api/app/outfits/shopping")
class ShoppingController {

    private final ShopForGapUseCase shop;

    ShoppingController(ShopForGapUseCase shop) {
        this.shop = shop;
    }

    /** 204 khi tủ đồ đủ món cho dịp này hoặc không tìm được sản phẩm. */
    @GetMapping
    ResponseEntity<ShoppingResponse> suggest(@AuthenticationPrincipal Jwt jwt, @RequestParam Occasion occasion) {
        return shop.suggest(CurrentUser.id(jwt), occasion)
                .map(s -> ResponseEntity.ok(new ShoppingResponse(
                        new Gap(s.gap().category(), s.gap().label()),
                        s.products().stream().map(Product::from).toList())))
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    /** Ghi lượt bấm và trả link affiliate để web chuyển sang sàn. */
    @PostMapping("/{productId}/open")
    LinkResponse open(@AuthenticationPrincipal Jwt jwt, @PathVariable String productId) {
        return shop.open(CurrentUser.id(jwt), productId)
                .map(LinkResponse::new)
                .orElseThrow(ProductExpiredException::new);
    }

    @ExceptionHandler(ProductExpiredException.class)
    ProblemDetail expired() {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Sản phẩm đã cũ, tải lại gợi ý để xem sản phẩm mới");
    }

    @ExceptionHandler(WardrobeUnavailableException.class)
    ProblemDetail wardrobeUnavailable(WardrobeUnavailableException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE, e.getMessage());
    }

    static class ProductExpiredException extends RuntimeException {
    }

    record ShoppingResponse(Gap gap, List<Product> products) {
    }

    record Gap(String category, String label) {
    }

    record Product(String id, String title, URI imageUrl, long minPriceVnd, long maxPriceVnd, String shopName,
            long unitsSold, String source) {

        static Product from(ProductOffer o) {
            return new Product(o.id(), o.title(), o.imageUrl(), o.minPriceVnd(), o.maxPriceVnd(), o.shopName(),
                    o.unitsSold(), o.source());
        }
    }

    record LinkResponse(URI url) {
    }
}
