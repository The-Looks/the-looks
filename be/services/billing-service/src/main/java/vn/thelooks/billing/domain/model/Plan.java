package vn.thelooks.billing.domain.model;

import java.util.Set;

/**
 * Ba gói và quyền lợi. Giá tính bằng VND.
 *
 * @param maxWardrobeItems   null = không giới hạn
 * @param aiSuggestionsPerDay số lượt AI gợi ý mỗi ngày; hết lượt vẫn có gợi ý theo thuật toán
 */
// ponytail: bảng giá nằm trong code; chuyển vào DB + màn admin khi cần đổi giá mà không deploy lại
public enum Plan {
    FREE("Free", 0, 0, 50, 3, Set.of()),
    PLUS("Plus", 39_000, 390_000, 300, 20, Set.of()),
    PRO("Pro", 79_000, 790_000, null, 100, Set.of(Feature.values()));

    private final String displayName;
    private final long monthlyPriceVnd;
    private final long yearlyPriceVnd;
    private final Integer maxWardrobeItems;
    private final int aiSuggestionsPerDay;
    private final Set<Feature> features;

    Plan(String displayName, long monthlyPriceVnd, long yearlyPriceVnd, Integer maxWardrobeItems,
            int aiSuggestionsPerDay, Set<Feature> features) {
        this.displayName = displayName;
        this.monthlyPriceVnd = monthlyPriceVnd;
        this.yearlyPriceVnd = yearlyPriceVnd;
        this.maxWardrobeItems = maxWardrobeItems;
        this.aiSuggestionsPerDay = aiSuggestionsPerDay;
        this.features = features;
    }

    public String displayName() {
        return displayName;
    }

    public long priceVnd(BillingPeriod period) {
        return period == BillingPeriod.MONTHLY ? monthlyPriceVnd : yearlyPriceVnd;
    }

    public long monthlyPriceVnd() {
        return monthlyPriceVnd;
    }

    public Integer maxWardrobeItems() {
        return maxWardrobeItems;
    }

    public int aiSuggestionsPerDay() {
        return aiSuggestionsPerDay;
    }

    public Set<Feature> features() {
        return features;
    }

    public boolean paid() {
        return this != FREE;
    }
}
