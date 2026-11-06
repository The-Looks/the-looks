package vn.thelooks.wardrobe.application.port.out;

public class WardrobeStatsAccessDeniedException extends RuntimeException {
    public WardrobeStatsAccessDeniedException() { super("Thống kê tủ đồ cần quyền WARDROBE_STATS của gói Pro."); }
}
