package vn.thelooks.wardrobe.application.port.out;

public interface WardrobeStatsAccess {
    /** Kiểm tra quyền hiện tại bằng JWT được chuyển tiếp; lỗi phụ thuộc phải từ chối truy cập. */
    void requireAccess();
}
