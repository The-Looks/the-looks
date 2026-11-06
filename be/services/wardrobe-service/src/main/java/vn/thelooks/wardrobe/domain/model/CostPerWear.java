package vn.thelooks.wardrobe.domain.model;

import java.math.BigDecimal;
import java.math.RoundingMode;

public record CostPerWear(BigDecimal purchasePrice, long wearCount, BigDecimal amount, Status status) {
    public enum Status { CALCULATED, MISSING_PRICE, NEVER_WORN }
    public static CostPerWear calculate(BigDecimal price, long count) {
        if (count < 0 || (price != null && price.signum() < 0)) throw new IllegalArgumentException("Giá mua và số lần mặc phải không âm");
        if (price == null) return new CostPerWear(null, count, null, Status.MISSING_PRICE);
        if (count == 0) return new CostPerWear(price, 0, null, Status.NEVER_WORN);
        return new CostPerWear(price, count, price.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP), Status.CALCULATED);
    }
}
