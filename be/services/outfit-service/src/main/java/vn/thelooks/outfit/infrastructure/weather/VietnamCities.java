package vn.thelooks.outfit.infrastructure.weather;

import java.text.Normalizer;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

/**
 * Toạ độ trung tâm hành chính của 34 tỉnh, thành phố từ 01/07/2025 (Nghị quyết 202/2025/QH15), cùng tên với danh sách
 * chọn trên web (fe/web-app/src/services/shared/vnCities.ts). Có bảng này thì không phải gọi API tra địa danh
 * (Open-Meteo geocoding hay hết lượt vì IP Render dùng chung); tên lạ (gõ tay từ trước) vẫn tra như cũ.
 */
final class VietnamCities {

    record Point(double latitude, double longitude) {}

    private static final Map<String, Point> CITIES = Map.ofEntries(
            Map.entry("ho chi minh", new Point(10.8231, 106.6297)),
            Map.entry("ha noi", new Point(21.0285, 105.8542)),
            Map.entry("da nang", new Point(16.0544, 108.2022)),
            Map.entry("hai phong", new Point(20.8449, 106.6881)),
            Map.entry("can tho", new Point(10.0452, 105.7469)),
            Map.entry("hue", new Point(16.4637, 107.5909)),
            Map.entry("an giang", new Point(10.0125, 105.0809)),
            Map.entry("bac ninh", new Point(21.2731, 106.1946)),
            Map.entry("ca mau", new Point(9.1769, 105.1524)),
            Map.entry("cao bang", new Point(22.6657, 106.2577)),
            Map.entry("dak lak", new Point(12.6667, 108.0500)),
            Map.entry("dien bien", new Point(21.3860, 103.0230)),
            Map.entry("dong nai", new Point(10.9574, 106.8426)),
            Map.entry("dong thap", new Point(10.3600, 106.3600)),
            Map.entry("gia lai", new Point(13.7820, 109.2190)),
            Map.entry("ha tinh", new Point(18.3428, 105.9057)),
            Map.entry("hung yen", new Point(20.6464, 106.0511)),
            Map.entry("khanh hoa", new Point(12.2388, 109.1967)),
            Map.entry("lai chau", new Point(22.3964, 103.4582)),
            Map.entry("lam dong", new Point(11.9404, 108.4583)),
            Map.entry("lang son", new Point(21.8537, 106.7615)),
            Map.entry("lao cai", new Point(21.7229, 104.9113)),
            Map.entry("nghe an", new Point(18.6796, 105.6813)),
            Map.entry("ninh binh", new Point(20.2506, 105.9745)),
            Map.entry("phu tho", new Point(21.3227, 105.4024)),
            Map.entry("quang ngai", new Point(15.1205, 108.7923)),
            Map.entry("quang ninh", new Point(20.9712, 107.0448)),
            Map.entry("quang tri", new Point(17.4689, 106.6223)),
            Map.entry("son la", new Point(21.3256, 103.9188)),
            Map.entry("tay ninh", new Point(10.5359, 106.4137)),
            Map.entry("thai nguyen", new Point(21.5942, 105.8482)),
            Map.entry("thanh hoa", new Point(19.8067, 105.7852)),
            Map.entry("tuyen quang", new Point(21.8236, 105.2142)),
            Map.entry("vinh long", new Point(10.2537, 105.9722)),
            // cách gọi quen thuộc
            Map.entry("hcm", new Point(10.8231, 106.6297)),
            Map.entry("sai gon", new Point(10.8231, 106.6297)),
            Map.entry("da lat", new Point(11.9404, 108.4583)),
            Map.entry("nha trang", new Point(12.2388, 109.1967)),
            Map.entry("vung tau", new Point(10.3460, 107.0843)),
            Map.entry("ha long", new Point(20.9712, 107.0448)),
            Map.entry("quy nhon", new Point(13.7820, 109.2190)),
            Map.entry("buon ma thuot", new Point(12.6667, 108.0500)),
            Map.entry("bien hoa", new Point(10.9574, 106.8426)),
            Map.entry("thu duc", new Point(10.8494, 106.7537)),
            Map.entry("binh duong", new Point(10.9804, 106.6519)));

    private VietnamCities() {
    }

    static Optional<Point> find(String city) {
        return Optional.ofNullable(CITIES.get(key(city)));
    }

    /** "TP. Hồ Chí Minh" → "ho chi minh"; bỏ dấu, bỏ chữ "thành phố" / "tp" / "tỉnh". */
    static String key(String city) {
        String plain = Normalizer.normalize(city.toLowerCase(Locale.ROOT).replace('đ', 'd'), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replaceAll("[^a-z0-9]+", " ")
                .trim();
        return plain.replaceFirst("^(thanh pho|tp|tinh) ", "");
    }
}
