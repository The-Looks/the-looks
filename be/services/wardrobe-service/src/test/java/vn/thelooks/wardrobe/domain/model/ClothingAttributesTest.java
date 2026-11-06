package vn.thelooks.wardrobe.domain.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import vn.thelooks.wardrobe.domain.exception.InvalidItemStateException;

class ClothingAttributesTest {
    @Test
    void keepsPurchaseDetailsOptionalAndNormalizesBrand() {
        var ai = new ClothingAttributes(Category.TOP, List.of(), null, Set.of(), Set.of());
        assertThat(ai.purchasePrice()).isNull();
        assertThat(ai.purchaseDate()).isNull();
        assertThat(ai.brand()).isNull();
        var purchased = attributes(new BigDecimal("300000.50"), "  Uniqlo  ");
        assertThat(purchased.purchasePrice()).isEqualByComparingTo("300000.50");
        assertThat(purchased.purchaseDate()).isEqualTo(LocalDate.of(2026, 11, 6));
        assertThat(purchased.brand()).isEqualTo("Uniqlo");
        assertThat(attributes(BigDecimal.ZERO, "   ").brand()).isNull();
    }

    @Test
    void rejectsNegativeOrInvalidPrecisionPricesAndLongBrands() {
        for (String price : List.of("-1", "0.001", "1000000000000")) {
            assertThatThrownBy(() -> attributes(new BigDecimal(price), null)).isInstanceOf(InvalidItemStateException.class);
        }
        assertThatThrownBy(() -> attributes(null, "x".repeat(101))).isInstanceOf(InvalidItemStateException.class);
    }

    private ClothingAttributes attributes(BigDecimal price, String brand) {
        return new ClothingAttributes(Category.TOP, List.of("white"), null, Set.of(), Set.of(), price,
                LocalDate.of(2026, 11, 6), brand);
    }
}
