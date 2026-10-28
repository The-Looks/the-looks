package vn.thelooks.outfit.domain;

/** Dịp mặc: đi học, đi làm, đi chơi, hẹn hò. */
public enum Occasion {
    SCHOOL("đi học"),
    WORK("đi làm"),
    HANGOUT("đi chơi"),
    DATE("hẹn hò");

    private final String label;

    Occasion(String label) {
        this.label = label;
    }

    /** Tên tiếng Việt, dùng trong lý do gợi ý. */
    public String label() {
        return label;
    }
}
