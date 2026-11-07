package vn.thelooks.wardrobe.api.dto;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.Validation;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import vn.thelooks.wardrobe.domain.model.Category;

class AttributesRequestTest {
    @Test
    void validatesPurchaseDetailsAndConvertsThemToDomain() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            var request = request("300000.50", "Uniqlo");
            assertThat(validator.validate(request)).isEmpty();
            assertThat(request.toDomain().purchasePrice()).isEqualByComparingTo("300000.50");
            assertThat(request.toDomain().purchaseDate()).isEqualTo(LocalDate.of(2026, 11, 6));
            assertThat(request.toDomain().brand()).isEqualTo("Uniqlo");
            assertThat(validator.validate(request(null, null))).isEmpty();
            assertThat(validator.validate(request("0", null))).isEmpty();
            for (String price : List.of("-1", "0.001", "1000000000000")) {
                assertThat(validator.validate(request(price, null))).isNotEmpty();
            }
            assertThat(validator.validate(request(null, "x".repeat(101)))).isNotEmpty();
        }
    }

    private AttributesRequest request(String price, String brand) {
        return new AttributesRequest(Category.TOP, List.of(), null, Set.of(), Set.of(),
                price == null ? null : new BigDecimal(price), LocalDate.of(2026, 11, 6), brand);
    }
}
