package vn.thelooks.billing.api.dto;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import vn.thelooks.billing.domain.model.BillingPeriod;
import vn.thelooks.billing.domain.model.Feature;
import vn.thelooks.billing.domain.model.Plan;

public record PlanResponse(Plan plan, String name, long monthlyPriceVnd, long yearlyPriceVnd, Limits limits,
        Set<Feature> features) {

    /** wardrobeItems null = không giới hạn. */
    public record Limits(Integer wardrobeItems, int aiSuggestionsPerDay) {

        public static Limits of(Plan p) {
            return new Limits(p.maxWardrobeItems(), p.aiSuggestionsPerDay());
        }
    }

    public static List<PlanResponse> all() {
        return Arrays.stream(Plan.values())
                .map(p -> new PlanResponse(p, p.displayName(), p.priceVnd(BillingPeriod.MONTHLY),
                        p.priceVnd(BillingPeriod.YEARLY), Limits.of(p), p.features()))
                .toList();
    }
}
