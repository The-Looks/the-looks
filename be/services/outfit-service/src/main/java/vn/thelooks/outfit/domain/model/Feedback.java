package vn.thelooks.outfit.domain.model;

import java.util.Collection;
import java.util.UUID;
import java.util.stream.Collectors;

/** Người dùng thích / không thích một tổ hợp món (không phụ thuộc thứ tự món). */
public enum Feedback {
    LIKE,
    DISLIKE;

    /** Khoá của tổ hợp: id các món sắp xếp tăng dần, nối bằng dấu phẩy. */
    public static String comboKey(Collection<UUID> itemIds) {
        return itemIds.stream().map(UUID::toString).sorted().collect(Collectors.joining(","));
    }
}
