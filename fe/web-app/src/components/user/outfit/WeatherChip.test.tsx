import { cleanup, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { outfitRequests } from '../../../services/user/outfit/requests';
import { profileRequests } from '../../../services/user/profile/requests';
import { WeatherChip } from './WeatherChip';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function show() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><MemoryRouter><WeatherChip /></MemoryRouter></QueryClientProvider>);
}

it('shows the weather of the profile city', async () => {
  vi.spyOn(outfitRequests, 'weather').mockResolvedValue({ temperatureC: 18.6, rainy: true });
  vi.spyOn(profileRequests, 'get').mockResolvedValue({ username: 'Lan', city: 'Hà Nội', hasAvatar: false });
  show();
  expect(await screen.findByText(/Hà Nội · 19°C, có mưa/)).toBeTruthy();
  expect(screen.queryByRole('link', { name: 'Chọn thành phố' })).toBeNull();
});

it('falls back to Ho Chi Minh City and invites choosing a city', async () => {
  vi.spyOn(outfitRequests, 'weather').mockResolvedValue({ temperatureC: 32, rainy: false });
  vi.spyOn(profileRequests, 'get').mockResolvedValue({ username: 'Lan', hasAvatar: false });
  show();
  expect(await screen.findByText(/TP. Hồ Chí Minh · 32°C/)).toBeTruthy();
  expect((await screen.findByRole('link', { name: 'Chọn thành phố' })).getAttribute('href')).toBe('/profile');
});

it('stays hidden when the weather service is unavailable', async () => {
  const weather = vi.spyOn(outfitRequests, 'weather').mockResolvedValue(null);
  vi.spyOn(profileRequests, 'get').mockResolvedValue({ username: 'Lan', hasAvatar: false });
  const { container } = show();
  await vi.waitFor(() => expect(weather).toHaveBeenCalled());
  expect(container.textContent).toBe('');
});
