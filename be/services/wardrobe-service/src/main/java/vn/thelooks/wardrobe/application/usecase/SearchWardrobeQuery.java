package vn.thelooks.wardrobe.application.usecase;

import java.util.List;
import java.util.UUID;
import vn.thelooks.wardrobe.domain.model.Category;
import vn.thelooks.wardrobe.domain.model.ClothingItem;
import vn.thelooks.wardrobe.domain.model.ItemStatus;
import vn.thelooks.wardrobe.domain.model.Season;

public interface SearchWardrobeQuery {
    enum Sort { NEWEST, LEAST_RECENTLY_WORN }

    record Filter(ItemStatus status, Category category, String color, Season season, String style,
            String q, Sort sort, int page, int size) {
        public Filter {
            if (page < 0 || page > 1_000_000 || size < 1 || size > 100) {
                throw new IllegalArgumentException("Trang phải từ 0 đến 1000000, mỗi trang từ 1 đến 100 món");
            }
            color = term(color, 30); style = term(style, 30); q = term(q, 100);
            sort = sort == null ? Sort.NEWEST : sort;
        }
        private static String term(String value, int max) {
            if (value == null || value.isBlank()) return null;
            String trimmed = value.trim();
            if (trimmed.length() > max) throw new IllegalArgumentException("Từ khoá lọc quá dài");
            return trimmed;
        }
    }

    record Page(List<ClothingItem> items, long total, int page, int size) {}
    Page search(UUID ownerId, Filter filter);
}
