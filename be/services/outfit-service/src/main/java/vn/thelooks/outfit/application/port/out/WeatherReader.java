package vn.thelooks.outfit.application.port.out;

import java.util.Optional;
import vn.thelooks.outfit.domain.model.Weather;

public interface WeatherReader {

    /** Rỗng khi không lấy được thời tiết; gợi ý khi đó lọc theo mùa của tháng. */
    Optional<Weather> current();
}
