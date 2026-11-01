package vn.thelooks.outfit.domain.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.thelooks.outfit.domain.service.OutfitRecommender;

class StyleProfileTest {

    static ClosetItem item(String category, String color, String tag) {
        return new ClosetItem(UUID.randomUUID(), category, List.of(color), Set.of(), Set.of(tag), null);
    }

    final ClosetItem minimalTee = item("TOP", "white", "minimal");
    final ClosetItem minimalPants = item("BOTTOM", "beige", "minimal");
    final ClosetItem loudTop = item("TOP", "red", "streetwear");
    final ClosetItem jeans = item("BOTTOM", "denim", "casual");
    final List<ClosetItem> closet = List.of(minimalTee, minimalPants, loudTop, jeans);

    StyleProfile likesMinimalHatesRed() {
        var votes = Map.of(
                Feedback.comboKey(List.of(minimalTee.id(), minimalPants.id())), Feedback.LIKE,
                Feedback.comboKey(List.of(loudTop.id(), jeans.id())), Feedback.DISLIKE);
        var saved = List.of(new Outfit(UUID.randomUUID(), UUID.randomUUID(), List.of(minimalTee.id(), jeans.id()), null, Instant.now()));
        return StyleProfile.learn(closet, votes, saved, Map.of(minimalTee.id(), 3L));
    }

    @Test
    void learnsWhatTheUserLikesAndAvoids() {
        StyleProfile taste = likesMinimalHatesRed();
        assertThat(taste.known()).isTrue();
        assertThat(taste.styles().get("minimal")).isEqualTo(1.0);
        assertThat(taste.colors().get("red")).isNegative();
        assertThat(taste.affinity(List.of(minimalTee, minimalPants))).isGreaterThan(taste.affinity(List.of(loudTop, jeans)));
        assertThat(taste.summary()).contains("phong cách minimal").contains("Ít hợp").contains("red");
    }

    @Test
    void notEnoughSignalsMeansNoPersonalisation() {
        StyleProfile taste = StyleProfile.learn(closet, Map.of(), List.of(), Map.of(minimalTee.id(), 1L));
        assertThat(taste.known()).isFalse();
        assertThat(taste.affinity(List.of(minimalTee))).isZero();
        assertThat(taste.summary()).isEmpty();
    }

    @Test
    void deletedItemsAreIgnored() {
        var votes = Map.of(Feedback.comboKey(List.of(UUID.randomUUID())), Feedback.LIKE);
        assertThat(StyleProfile.learn(closet, votes, List.of(), Map.of()).styles()).isEmpty();
    }

    @Test
    void recommenderRanksOutfitsMatchingTasteHigher() {
        var recommender = new OutfitRecommender();
        Instant now = Instant.parse("2026-11-01T03:00:00Z");
        var neutralCloset = List.of(minimalTee, loudTop, minimalPants);
        // Không tính gu: áo đỏ lâu chưa mặc hơn nên bộ áo đỏ + quần be đứng đầu.
        Map<UUID, Instant> lastWorn = Map.of(
                minimalTee.id(), now.minus(java.time.Duration.ofDays(15)),
                minimalPants.id(), now.minus(java.time.Duration.ofDays(15)),
                loudTop.id(), now.minus(java.time.Duration.ofDays(20)));

        var without = recommender.recommend(neutralCloset, lastWorn, Map.of(), StyleProfile.NONE, null, now, Set.of("AUTUMN"), 1);
        var with = recommender.recommend(neutralCloset, lastWorn, Map.of(), likesMinimalHatesRed(), null, now, Set.of("AUTUMN"), 1);

        assertThat(without.getFirst().items()).containsExactly(loudTop, minimalPants);
        assertThat(with.getFirst().items()).containsExactly(minimalTee, minimalPants);
        assertThat(with.getFirst().reason()).contains("Đúng gu của bạn");
    }
}
