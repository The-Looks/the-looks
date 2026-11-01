package vn.thelooks.outfit.infrastructure.weather;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import vn.thelooks.outfit.application.port.out.WeatherReader;
import vn.thelooks.outfit.domain.model.Weather;

/**
 * Open-Meteo: miễn phí, không cần API key. Cache 30 phút nên mỗi giờ chỉ gọi tối đa 2 lần.
 * Lỗi mạng không làm hỏng gợi ý: trả rỗng, gợi ý quay về lọc theo mùa.
 */
// ponytail: một vị trí cấu hình cho mọi người dùng; thêm vị trí theo người dùng khi có trường "thành phố" trong hồ sơ
@Component
class OpenMeteoWeatherReader implements WeatherReader {

    private static final Logger log = LoggerFactory.getLogger(OpenMeteoWeatherReader.class);
    static final Duration CACHE_TTL = Duration.ofMinutes(30);

    private final RestClient http;
    private final double latitude;
    private final double longitude;
    private final Clock clock;
    private volatile Weather cached;
    private volatile Instant cachedAt = Instant.MIN;

    OpenMeteoWeatherReader(
            @Value("${thelooks.weather.url:https://api.open-meteo.com}") String url,
            @Value("${thelooks.weather.latitude}") double latitude,
            @Value("${thelooks.weather.longitude}") double longitude,
            Clock clock) {
        var requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(2));
        requestFactory.setReadTimeout(Duration.ofSeconds(3));
        this.http = RestClient.builder().baseUrl(url).requestFactory(requestFactory).build();
        this.latitude = latitude;
        this.longitude = longitude;
        this.clock = clock;
    }

    @Override
    public Optional<Weather> current() {
        Instant now = clock.instant();
        if (cached != null && now.isBefore(cachedAt.plus(CACHE_TTL))) {
            return Optional.of(cached);
        }
        try {
            Response body = http.get()
                    .uri(b -> b.path("/v1/forecast")
                            .queryParam("latitude", latitude)
                            .queryParam("longitude", longitude)
                            .queryParam("current", "temperature_2m,precipitation")
                            .build())
                    .retrieve()
                    .body(Response.class);
            if (body == null || body.current() == null || body.current().temperature() == null) {
                return Optional.ofNullable(cached);
            }
            cached = new Weather(body.current().temperature(),
                    body.current().precipitation() == null ? 0 : body.current().precipitation());
            cachedAt = now;
            return Optional.of(cached);
        } catch (RestClientException e) {
            log.warn("Không lấy được thời tiết từ Open-Meteo: {}", e.getMessage());
            return Optional.ofNullable(cached); // dùng tạm số liệu cũ nếu có
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Response(Current current) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Current(@JsonProperty("temperature_2m") Double temperature, Double precipitation) {
    }
}
