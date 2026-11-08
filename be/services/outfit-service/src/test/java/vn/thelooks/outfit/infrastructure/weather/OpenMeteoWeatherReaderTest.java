package vn.thelooks.outfit.infrastructure.weather;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import vn.thelooks.security.BearerTokenForwardingInterceptor;

class OpenMeteoWeatherReaderTest {
    @Test
    void usesTheCityFromTheAuthenticatedProfileForForecastCoordinates() throws Exception {
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        var forecastQuery = new AtomicReference<String>();
        server.createContext("/api/app/me/profile", exchange -> respond(exchange,
                "{\"username\":\"Lan\",\"city\":\"Sa Pa\",\"hasAvatar\":false}"));
        server.createContext("/v1/search", exchange -> respond(exchange,
                "{\"results\":[{\"name\":\"Hanoi\",\"latitude\":21.03,\"longitude\":105.85}]}"));
        server.createContext("/v1/forecast", exchange -> {
            forecastQuery.set(exchange.getRequestURI().getRawQuery());
            respond(exchange, "{\"current\":{\"temperature_2m\":19.0,\"precipitation\":0.0}}");
        });
        server.start();
        try {
            String base = "http://127.0.0.1:" + server.getAddress().getPort();
            var reader = new OpenMeteoWeatherReader(base, base, base, 10.8231, 106.6297,
                    Clock.fixed(Instant.parse("2026-11-07T00:00:00Z"), ZoneOffset.UTC),
                    new BearerTokenForwardingInterceptor());
            var weather = reader.current(UUID.randomUUID());
            assertTrue(weather.isPresent());
            assertEquals(19.0, weather.orElseThrow().temperatureC());
            assertTrue(forecastQuery.get().contains("latitude=21.03"));
            assertTrue(forecastQuery.get().contains("longitude=105.85"));
        } finally { server.stop(0); }
    }

    @Test
    void fallsBackToTheDefaultCityWhenTheProfileCannotBeRead() throws Exception {
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        var forecastQuery = new AtomicReference<String>();
        server.createContext("/v1/forecast", exchange -> {
            forecastQuery.set(exchange.getRequestURI().getRawQuery());
            respond(exchange, "{\"current\":{\"temperature_2m\":31.0,\"precipitation\":0.0}}");
        });
        server.start();
        try {
            String base = "http://127.0.0.1:" + server.getAddress().getPort();
            String deadAuth = "http://127.0.0.1:1";
            var reader = new OpenMeteoWeatherReader(base, base, deadAuth, 10.8231, 106.6297,
                    Clock.fixed(Instant.parse("2026-11-07T00:00:00Z"), ZoneOffset.UTC),
                    new BearerTokenForwardingInterceptor());
            var weather = reader.current(UUID.randomUUID());
            assertTrue(weather.isPresent());
            assertEquals(31.0, weather.orElseThrow().temperatureC());
            assertTrue(forecastQuery.get().contains("latitude=10.8231"));
        } finally { server.stop(0); }
    }

    @Test
    void stopsCallingOpenMeteoForAnHourAfterTheDailyLimit() throws Exception {
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        var calls = new java.util.concurrent.atomic.AtomicInteger();
        server.createContext("/v1/forecast", exchange -> {
            calls.incrementAndGet();
            exchange.sendResponseHeaders(429, -1);
            exchange.close();
        });
        server.start();
        try {
            String base = "http://127.0.0.1:" + server.getAddress().getPort();
            var clock = new java.util.concurrent.atomic.AtomicReference<>(Instant.parse("2026-11-07T00:00:00Z"));
            var reader = new OpenMeteoWeatherReader(base, base, "http://127.0.0.1:1", 10.8231, 106.6297,
                    new Clock() {
                        public java.time.ZoneId getZone() { return ZoneOffset.UTC; }
                        public Clock withZone(java.time.ZoneId zone) { return this; }
                        public Instant instant() { return clock.get(); }
                    }, new BearerTokenForwardingInterceptor());
            assertTrue(reader.current(UUID.randomUUID()).isEmpty());
            assertTrue(reader.current(UUID.randomUUID()).isEmpty());
            assertEquals(1, calls.get()); // lần 2 không gọi lại
            clock.set(clock.get().plus(java.time.Duration.ofMinutes(61)));
            reader.current(UUID.randomUUID());
            assertEquals(2, calls.get());
        } finally { server.stop(0); }
    }

    private static void respond(com.sun.net.httpserver.HttpExchange exchange, String json) throws java.io.IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(200, bytes.length);
        try (var out = exchange.getResponseBody()) { out.write(bytes); }
    }
}
