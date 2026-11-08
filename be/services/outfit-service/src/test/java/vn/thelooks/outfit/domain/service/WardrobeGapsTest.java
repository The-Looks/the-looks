package vn.thelooks.outfit.domain.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.thelooks.outfit.domain.model.ClosetItem;
import vn.thelooks.outfit.domain.model.Occasion;
import vn.thelooks.outfit.domain.model.StylePreferences;
import vn.thelooks.outfit.domain.model.StylePreferences.Budget;
import vn.thelooks.outfit.domain.model.StylePreferences.Gender;
import vn.thelooks.outfit.domain.model.WardrobeGap;

class WardrobeGapsTest {

    static ClosetItem item(String category) {
        return new ClosetItem(UUID.randomUUID(), category, List.of(), null, null, null);
    }

    static String gap(Occasion occasion, String... categories) {
        return WardrobeGaps.find(List.of(categories).stream().map(WardrobeGapsTest::item).toList(), occasion)
                .map(WardrobeGap::category).orElse("NONE");
    }

    @Test
    void bodyBeforeShoes() {
        assertThat(gap(Occasion.HANGOUT)).isEqualTo("TOP");
        assertThat(gap(Occasion.HANGOUT, "TOP")).isEqualTo("BOTTOM");
        assertThat(gap(Occasion.HANGOUT, "TOP", "BOTTOM")).isEqualTo("SHOES");
        assertThat(gap(Occasion.HANGOUT, "TOP", "BOTTOM", "SHOES")).isEqualTo("NONE");
    }

    @Test
    void aDressCoversTopAndBottom() {
        assertThat(gap(Occasion.DATE, "dress")).isEqualTo("SHOES");
    }

    @Test
    void workGetsOfficeKeywords() {
        var work = WardrobeGaps.find(List.of(item("TOP"), item("BOTTOM")), Occasion.WORK).orElseThrow();
        var school = WardrobeGaps.find(List.of(item("TOP"), item("BOTTOM")), Occasion.SCHOOL).orElseThrow();
        assertThat(work.keyword()).isEqualTo("loafer");
        assertThat(school.keyword()).isEqualTo("sneaker");
        assertThat(school.label()).isEqualTo("giày");
    }

    @Test
    void genderAndBudgetComeFromThePreferences() {
        var female = new StylePreferences(Gender.FEMALE, java.util.Set.of(), Budget.LOW, null);
        var gap = WardrobeGaps.find(List.of(), Occasion.HANGOUT, female).orElseThrow();
        assertThat(gap.keyword()).isEqualTo("croptop");
        assertThat(gap.gender()).isEqualTo(Gender.FEMALE);
        assertThat(gap.budget()).isEqualTo(Budget.LOW);
        assertThat(WardrobeGaps.find(List.of(item("TOP")), Occasion.WORK,
                new StylePreferences(Gender.MALE, null, null, null)).orElseThrow().keyword()).isEqualTo("baggy");
    }

    static ClosetItem tagged(String category, String... tags) {
        return new ClosetItem(UUID.randomUUID(), category, List.of(), null, java.util.Set.of(tags), null);
    }

    @Test
    void aFullClosetStillLacksAnItemForTheOccasion() {
        var closet = List.of(tagged("TOP", "casual"), tagged("BOTTOM", "office"), tagged("SHOES", "formal"));
        var gap = WardrobeGaps.find(closet, Occasion.WORK, new StylePreferences(Gender.MALE, null, null, java.util.Set.of("white"))).orElseThrow();
        assertThat(gap.category()).isEqualTo("TOP");
        assertThat(gap.keyword()).isEqualTo("so mi nam");
        assertThat(gap.label()).isEqualTo("áo đi làm");
        assertThat(gap.colors()).containsExactly("white");
        assertThat(WardrobeGaps.find(closet, Occasion.SCHOOL).orElseThrow().keyword()).isEqualTo("quan jeans"); // áo casual hợp đi học, quần tây thì không
    }

    @Test
    void followsTheStyleTheUserChoseInTheSurvey() {
        var closet = List.of(tagged("TOP", "streetwear"), tagged("BOTTOM", "streetwear"), tagged("SHOES", "streetwear"));
        var minimal = new StylePreferences(Gender.FEMALE, java.util.Set.of("minimal"), null, null);
        var gap = WardrobeGaps.find(closet, null, minimal).orElseThrow();
        assertThat(gap.keyword()).isEqualTo("ao thun tron nu");
        assertThat(gap.label()).isEqualTo("áo tối giản");
        assertThat(WardrobeGaps.find(closet, null, StylePreferences.NONE)).isEmpty(); // chưa khảo sát, không đoán bừa
        var work = WardrobeGaps.find(closet, Occasion.WORK, minimal).orElseThrow(); // minimal hợp đi làm
        assertThat(work.keyword()).isEqualTo("ao thun tron nu");
    }

    @Test
    void untaggedItemsAndAFittingDressCountAsCovered() {
        assertThat(WardrobeGaps.find(List.of(item("TOP"), item("BOTTOM"), item("SHOES")), Occasion.WORK)).isEmpty();
        var date = WardrobeGaps.find(List.of(tagged("DRESS", "romantic"), tagged("SHOES", "sporty")), Occasion.DATE).orElseThrow();
        assertThat(date.category()).isEqualTo("SHOES");
        assertThat(date.keyword()).isEqualTo("mary jane");
    }
}
