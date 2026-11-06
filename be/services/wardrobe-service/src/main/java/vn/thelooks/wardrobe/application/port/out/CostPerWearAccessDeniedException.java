package vn.thelooks.wardrobe.application.port.out;

public class CostPerWearAccessDeniedException extends RuntimeException {
    public CostPerWearAccessDeniedException() { super("Chi phí mỗi lần mặc cần quyền COST_PER_WEAR của gói Pro."); }
}
