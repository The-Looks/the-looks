package vn.thelooks.wardrobe.domain.model;

import static org.assertj.core.api.Assertions.*;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class CostPerWearTest {
    @Test
    void dividesPurchasePriceByWearCountWithDecimalHalfUpRounding() {
        assertThat(CostPerWear.calculate(new BigDecimal("300000"), 10).amount()).isEqualByComparingTo("30000.00");
        assertThat(CostPerWear.calculate(new BigDecimal("100"), 3).amount()).isEqualByComparingTo("33.33");
        assertThat(CostPerWear.calculate(new BigDecimal("0.01"), 2).amount()).isEqualByComparingTo("0.01");
        assertThat(CostPerWear.calculate(BigDecimal.ZERO, 10).amount()).isEqualByComparingTo("0.00");
    }
    @Test
    void doesNotConfuseMissingPriceOrZeroWearsWithZeroCost() {
        var missing = CostPerWear.calculate(null, 10);
        assertThat(missing.status()).isEqualTo(CostPerWear.Status.MISSING_PRICE); assertThat(missing.amount()).isNull();
        var never = CostPerWear.calculate(new BigDecimal("300000"), 0);
        assertThat(never.status()).isEqualTo(CostPerWear.Status.NEVER_WORN); assertThat(never.amount()).isNull();
        assertThat(CostPerWear.calculate(BigDecimal.ZERO, 0).status()).isEqualTo(CostPerWear.Status.NEVER_WORN);
    }
    @Test
    void rejectsNegativeInputs() {
        assertThatThrownBy(() -> CostPerWear.calculate(BigDecimal.ONE, -1)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> CostPerWear.calculate(new BigDecimal("-1"), 1)).isInstanceOf(IllegalArgumentException.class);
    }
}
