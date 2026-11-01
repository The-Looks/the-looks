package vn.thelooks.outfit.domain.model;

/** Thời tiết hiện tại ở nơi người dùng. */
public record Weather(double temperatureC, double precipitationMm) {

    public boolean rainy() {
        return precipitationMm >= 0.5;
    }
}
