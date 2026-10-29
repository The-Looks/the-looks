package vn.thelooks.outfit.domain.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.time.Instant;
import java.time.Month;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.thelooks.outfit.domain.model.ClosetItem;
import vn.thelooks.outfit.domain.model.Occasion;
import vn.thelooks.outfit.domain.model.OutfitSuggestion;

class OutfitRecommenderTest {

    static final Instant NOW = Instant.parse("2026-10-25T03:00:00Z");
    final OutfitRecommender recommender = new OutfitRecommender();

    static ClosetItem item(String category, String color, String... tags) {
        return new ClosetItem(UUID.randomUUID(), category, List.of(color), Set.of(), Set.of(tags), null);
    }

    static Instant daysAgo(int days) {
        return NOW.minus(Duration.ofDays(days));
    }

    @Test
    void workOccasionPrefersFormalItems() {
        ClosetItem shirt = item("TOP", "white", "formal");
        ClosetItem tee = item("TOP", "white", "streetwear");
        ClosetItem trousers = item("BOTTOM", "black", "office");

        List<OutfitSuggestion> result = recommender.recommend(
                List.of(tee, shirt, trousers), Map.of(), Occasion.WORK, NOW, "AUTUMN", 1);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().items()).containsExactly(shirt, trousers);
        assertThat(result.getFirst().reason()).contains("Hợp dịp đi làm");
    }

    @Test
    void quickPickPrefersItemsNotWornForLong() {
        ClosetItem wornYesterday = item("TOP", "white");
        ClosetItem wornLongAgo = item("TOP", "white");
        ClosetItem jeans = item("BOTTOM", "denim");
        Map<UUID, Instant> lastWorn = Map.of(
                wornYesterday.id(), daysAgo(1),
                wornLongAgo.id(), daysAgo(21),
                jeans.id(), daysAgo(21));

        List<OutfitSuggestion> result = recommender.recommend(
                List.of(wornYesterday, wornLongAgo, jeans), lastWorn, null, NOW, "AUTUMN", 1);

        assertThat(result.getFirst().items()).containsExactly(wornLongAgo, jeans);
        assertThat(result.getFirst().reason()).contains("21 ngày chưa mặc");
    }

    @Test
    void neverWornItemsAreMentioned() {
        List<OutfitSuggestion> result = recommender.recommend(
                List.of(item("DRESS", "red")), Map.of(), null, NOW, "AUTUMN", 1);

        assertThat(result.getFirst().reason()).contains("chưa mặc lần nào");
    }

    @Test
    void outOfSeasonItemsAreSkipped() {
        ClosetItem coatTop = new ClosetItem(UUID.randomUUID(), "TOP", List.of("gray"), Set.of("WINTER"), Set.of(), null);
        ClosetItem summerTop = new ClosetItem(UUID.randomUUID(), "TOP", List.of("white"), Set.of("SUMMER"), Set.of(), null);
        ClosetItem shorts = item("BOTTOM", "beige");

        List<OutfitSuggestion> result = recommender.recommend(
                List.of(coatTop, summerTop, shorts), Map.of(), null, NOW, "SUMMER", 5);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().items()).containsExactly(summerTop, shorts);
    }

    @Test
    void addsBestMatchingShoesWhenAvailable() {
        ClosetItem top = item("TOP", "white", "formal");
        ClosetItem bottom = item("BOTTOM", "black", "formal");
        ClosetItem sneakers = item("SHOES", "white", "sporty");
        ClosetItem loafers = item("SHOES", "brown", "formal");

        List<OutfitSuggestion> result = recommender.recommend(
                List.of(top, bottom, sneakers, loafers), Map.of(), Occasion.WORK, NOW, "AUTUMN", 1);

        assertThat(result.getFirst().items()).containsExactly(top, bottom, loafers);
    }

    @Test
    void suggestionsAvoidReusingTheSameTop() {
        ClosetItem top1 = item("TOP", "white");
        ClosetItem top2 = item("TOP", "black");
        ClosetItem bottom1 = item("BOTTOM", "navy");
        ClosetItem bottom2 = item("BOTTOM", "beige");

        List<OutfitSuggestion> result = recommender.recommend(
                List.of(top1, top2, bottom1, bottom2), Map.of(), Occasion.HANGOUT, NOW, "AUTUMN", 2);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).items()).doesNotContainAnyElementsOf(result.get(1).items());
    }

    @Test
    void clashingColorsScoreLower() {
        ClosetItem neutralTop = item("TOP", "white");
        ClosetItem loudTop = item("TOP", "green");
        ClosetItem redSkirt = item("BOTTOM", "red");

        List<OutfitSuggestion> result = recommender.recommend(
                List.of(loudTop, neutralTop, redSkirt), Map.of(), null, NOW, "AUTUMN", 2);

        assertThat(result.getFirst().items()).containsExactly(neutralTop, redSkirt);
    }

    @Test
    void returnsEmptyWhenNothingToCombine() {
        assertThat(recommender.recommend(List.of(item("SHOES", "black")), Map.of(), null, NOW, "AUTUMN", 3)).isEmpty();
        assertThat(recommender.recommend(List.of(item("DRESS", "black")), Map.of(), null, NOW, "AUTUMN", 0)).isEmpty();
    }

    @Test
    void seasonByMonth() {
        assertThat(OutfitRecommender.seasonOf(Month.APRIL)).isEqualTo("SPRING");
        assertThat(OutfitRecommender.seasonOf(Month.JULY)).isEqualTo("SUMMER");
        assertThat(OutfitRecommender.seasonOf(Month.OCTOBER)).isEqualTo("AUTUMN");
        assertThat(OutfitRecommender.seasonOf(Month.JANUARY)).isEqualTo("WINTER");
    }
}
