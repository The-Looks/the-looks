package vn.thelooks.outfit.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.thelooks.outfit.application.port.out.WeatherReader;
import vn.thelooks.security.CurrentUser;

/** Thời tiết hôm nay ở thành phố trong hồ sơ (mặc định TP.HCM), đúng số liệu gợi ý outfit đang dùng. */
@RestController
class WeatherController {

    record WeatherResponse(double temperatureC, boolean rainy) {}

    private final WeatherReader weather;

    WeatherController(WeatherReader weather) {
        this.weather = weather;
    }

    @GetMapping("/api/app/outfits/weather")
    ResponseEntity<WeatherResponse> today(@AuthenticationPrincipal Jwt jwt) {
        return weather.current(CurrentUser.id(jwt))
                .map(w -> ResponseEntity.ok(new WeatherResponse(Math.round(w.temperatureC() * 10) / 10.0, w.rainy())))
                .orElseGet(() -> ResponseEntity.noContent().build());
    }
}
