package vn.thelooks.outfit.domain.model;

/** Dịp mặc. Lưu trong DB bằng tên hằng (varchar 20), thêm dịp mới không cần migration. */
public enum Occasion {
    SCHOOL("đi học"),
    WORK("đi làm"),
    HANGOUT("đi chơi"),
    DATE("hẹn hò"),
    PARTY("đi tiệc"),
    TRAVEL("du lịch"),
    SPORT("tập thể thao"),
    WEDDING("dự tiệc cưới"),
    INTERVIEW("phỏng vấn");

    private final String label;

    Occasion(String label) {
        this.label = label;
    }

    /** Tên tiếng Việt, dùng trong lý do gợi ý. */
    public String label() {
        return label;
    }
}
