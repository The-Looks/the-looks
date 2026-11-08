package vn.thelooks.outfit.application.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import vn.thelooks.outfit.domain.model.ProductOffer;

class ShoppingServiceTest {

    static ProductOffer offer(String id, String title, String source) {
        return new ProductOffer(id, title, null, 100_000, 100_000, "shop", 0, URI.create("https://shop/" + id), source);
    }

    @Test
    void takesProductsFromEverySourceInTurn() {
        var tiktok = List.of(offer("t1", "a", "TIKTOK_SHOP"), offer("t2", "b", "TIKTOK_SHOP"), offer("t3", "c", "TIKTOK_SHOP"));
        var coolmate = List.of(offer("c1", "d", "AT_COOLMATE"));
        assertThat(ShoppingService.interleave(List.of(tiktok, coolmate, List.of())))
                .extracting(ProductOffer::id).containsExactly("t1", "c1", "t2", "t3");
    }

    @Test
    void putsFavouriteColoursFirstWithoutReorderingTheRest() {
        var offers = List.of(offer("1", "Áo sơ mi xanh", "x"), offer("2", "Áo sơ mi TRẮNG nam", "x"),
                offer("3", "Áo thun be", "x"), offer("4", "Áo bé gái đỏ", "x"));
        assertThat(ShoppingService.byColor(offers, Set.of("white", "beige")))
                .extracting(ProductOffer::id).containsExactly("2", "3", "1", "4");
        assertThat(ShoppingService.byColor(offers, Set.of())).isEqualTo(offers);
    }
}
