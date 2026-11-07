package vn.thelooks.outfit.infrastructure.weather;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import vn.thelooks.outfit.application.port.out.WeatherReader;
import vn.thelooks.outfit.domain.model.Weather;
import vn.thelooks.security.BearerTokenForwardingInterceptor;

/**
 * Open-Meteo: miễn phí, không cần API key. Cache thời tiết 30 phút theo thành phố.
 * Lỗi mạng không làm hỏng gợi ý: trả rỗng, gợi ý quay về lọc theo mùa.
 */
@Component
class OpenMeteoWeatherReader implements WeatherReader {

    private static final Logger log = LoggerFactory.getLogger(OpenMeteoWeatherReader.class);
    static final Duration CACHE_TTL = Duration.ofMinutes(30);

    private final RestClient http;
    private final RestClient geocoding;
    private final RestClient auth;
    private final double latitude;
    private final double longitude;
    private final Clock clock;
    private final ConcurrentHashMap<String, Cache<Coordinates>> places = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Cache<Weather>> forecasts = new ConcurrentHashMap<>();

    OpenMeteoWeatherReader(
            @Value("${thelooks.weather.url:https://api.open-meteo.com}") String url,
            @Value("${thelooks.weather.geocoding-url:https://geocoding-api.open-meteo.com}") String geocodingUrl,
            @Value("${thelooks.services.auth-url:http://localhost:8081}") String authUrl,
            @Value("${thelooks.weather.latitude}") double latitude,
            @Value("${thelooks.weather.longitude}") double longitude,
            Clock clock, BearerTokenForwardingInterceptor bearerToken) {
        var requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(2));
        requestFactory.setReadTimeout(Duration.ofSeconds(3));
        this.http = RestClient.builder().baseUrl(url).requestFactory(requestFactory).build();
        this.geocoding = RestClient.builder().baseUrl(geocodingUrl).requestFactory(requestFactory).build();
        this.auth = RestClient.builder().baseUrl(authUrl).requestFactory(requestFactory)
                .requestInterceptor(bearerToken).build();
        this.latitude = latitude;
        this.longitude = longitude;
        this.clock = clock;
    }

    @Override
    public Optional<Weather> current(UUID ownerId) {
        Instant now = clock.instant();
        String city;
        try {
            var profile = auth.get().uri("/api/app/me/profile").retrieve().body(Profile.class);
            city = profile == null ? null : profile.city();
        } catch (RestClientException error) {
            // Không đọc được hồ sơ (auth đang ngủ, thiếu AUTH_SERVICE_URL…) → vẫn dùng thành phố mặc định
            log.warn("Không đọc được thành phố hồ sơ cho {}, dùng thành phố mặc định: {}", ownerId, error.getMessage());
            city = null;
        }
        String key = city == null ? "" : city.trim().toLowerCase(Locale.ROOT);
        Cache<Weather> cached = forecasts.get(key);
        if (cached != null && now.isBefore(cached.at().plus(CACHE_TTL))) return Optional.of(cached.value());
        try {
            Coordinates coordinates = key.isEmpty() ? new Coordinates(latitude, longitude) : coordinates(city, key, now);
            if (coordinates == null) return Optional.empty();
            Response body = http.get()
                    .uri(b -> b.path("/v1/forecast")
                            .queryParam("latitude", coordinates.latitude())
                            .queryParam("longitude", coordinates.longitude())
                            .queryParam("current", "temperature_2m,precipitation")
                            .build())
                    .retrieve()
                    .body(Response.class);
            if (body == null || body.current() == null || body.current().temperature() == null) {
                return cached == null ? Optional.empty() : Optional.of(cached.value());
            }
            Weather weather = new Weather(body.current().temperature(),
                    body.current().precipitation() == null ? 0 : body.current().precipitation());
            forecasts.put(key, new Cache<>(weather, now));
            return Optional.of(weather);
        } catch (RestClientException e) {
            log.warn("Không lấy được thời tiết từ Open-Meteo: {}", e.getMessage());
            return cached == null ? Optional.empty() : Optional.of(cached.value());
        }
    }

    private Coordinates coordinates(String city, String key, Instant now) {
        Cache<Coordinates> cached = places.get(key);
        if (cached != null && now.isBefore(cached.at().plus(Duration.ofDays(1)))) return cached.value();
        GeoResponse response = geocoding.get().uri(b -> b.path("/v1/search")
                .queryParam("name", city).queryParam("count", 1).queryParam("language", "vi").build())
                .retrieve().body(GeoResponse.class);
        if (response == null || response.results() == null || response.results().isEmpty()) return null;
        var place = response.results().getFirst();
        Coordinates coordinates = new Coordinates(place.latitude(), place.longitude());
        places.put(key, new Cache<>(coordinates, now));
        return coordinates;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Profile(String city) {}
    @JsonIgnoreProperties(ignoreUnknown = true)
    record Coordinates(double latitude, double longitude) {}
    record Cache<T>(T value, Instant at) {}
    @JsonIgnoreProperties(ignoreUnknown = true)
    record GeoResponse(List<Coordinates> results) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Response(Current current) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Current(@JsonProperty("temperature_2m") Double temperature, Double precipitation) {
    }
}
