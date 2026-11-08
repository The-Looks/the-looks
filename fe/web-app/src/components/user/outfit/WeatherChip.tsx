import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useWeather } from '../../../hooks/user/outfit/api';
import { profileKey, profileRequests } from '../../../services/user/profile/requests';

/** Thời tiết đang dùng để gợi ý: "☀️ Hà Nội · 19°C". Chưa chọn thành phố thì mời chọn trong Hồ sơ. */
export function WeatherChip() {
  const weather = useWeather();
  const profile = useQuery({ queryKey: profileKey, queryFn: profileRequests.get });
  if (!weather.data) return null;
  const city = profile.data?.city || 'TP. Hồ Chí Minh';
  const { temperatureC, rainy } = weather.data;
  const icon = rainy ? '🌧️' : temperatureC >= 30 ? '☀️' : temperatureC <= 20 ? '🧥' : '⛅';
  return (
    <p className="small muted weather-chip" aria-live="polite">
      <span aria-hidden="true">{icon}</span> {city} · {Math.round(temperatureC)}°C{rainy ? ', có mưa' : ''} · gợi ý đã tính thời tiết
      {!profile.data?.city && <> · <Link to="/profile">Chọn thành phố</Link></>}
    </p>
  );
}
