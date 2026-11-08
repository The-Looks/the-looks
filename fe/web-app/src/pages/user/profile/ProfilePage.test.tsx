import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { readProfileDraft } from '../../../services/user/profile/draft';
import { profileRequests, type UserProfile } from '../../../services/user/profile/requests';
import { accountAvatarSource } from '../../../services/user/profile/avatar';
import { readOnboarding } from '../../../services/user/onboarding/progress';
import { ProfilePage } from './ProfilePage';

vi.mock('../../../hooks/user/outfit/api', () => ({ usePreferences: () => ({ data: null }) }));

beforeEach(() => vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
  matches: false, addListener: vi.fn(), removeListener: vi.fn(),
  addEventListener: vi.fn(), removeEventListener: vi.fn(),
})));
afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it('restores an unfinished profile edit and removes its draft after saving', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } });
  client.setQueryData(['me'], { id: 'user-1', username: 'An', email: 'an@example.com', createdAt: '2026-01-01T00:00:00Z', permissions: [] });
  client.setQueryData(['me', 'profile'], { username: 'An', city: 'Huế', hasAvatar: false });
  client.setQueryData(['me', 'auth-methods'], { hasPassword: true });
  client.setQueryData(['wardrobe', 'list', undefined, undefined], []);
  client.setQueryData(['outfits'], []);
  client.setQueryData(['polls'], []);
  const show = () => render(<QueryClientProvider client={client}><MemoryRouter><ProfilePage /></MemoryRouter></QueryClientProvider>);

  const first = show();
  fireEvent.change(screen.getByLabelText('Tên hiển thị'), { target: { value: 'Bình' } });
  expect(readProfileDraft('user-1')?.username).toBe('Bình');
  first.unmount();

  show();
  expect((screen.getByLabelText('Tên hiển thị') as HTMLInputElement).value).toBe('Bình');
  vi.spyOn(profileRequests, 'update').mockResolvedValue({ username: 'Bình', city: 'Huế', hasAvatar: false });
  vi.spyOn(client, 'invalidateQueries').mockResolvedValue();
  fireEvent.click(screen.getByRole('button', { name: 'Lưu hồ sơ' }));
  await waitFor(() => expect(readProfileDraft('user-1')).toBeNull());
  expect(profileRequests.update).toHaveBeenCalledWith('Bình', 'Huế');
});

it('saves a new mascot for the account and updates its avatar', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } });
  client.setQueryData(['me'], { id: 'user-1', username: 'An', email: 'an@example.com', createdAt: '2026-01-01T00:00:00Z', permissions: [] });
  client.setQueryData(['me', 'profile'], { username: 'An', city: 'Huế', hasAvatar: false, mascotId: 'cat' });
  client.setQueryData(['me', 'auth-methods'], { hasPassword: true });
  client.setQueryData(['wardrobe', 'list', undefined, undefined], []);
  client.setQueryData(['outfits'], []);
  client.setQueryData(['polls'], []);
  vi.spyOn(profileRequests, 'selectMascot').mockResolvedValue({ username: 'An', city: 'Huế', hasAvatar: false, mascotId: 'fox' });

  render(<QueryClientProvider client={client}><MemoryRouter><ProfilePage /></MemoryRouter></QueryClientProvider>);
  fireEvent.click(screen.getByRole('radio', { name: 'Cáo Phố Streetwear' }));
  await waitFor(() => expect((screen.getByRole('radio', { name: 'Cáo Phố Streetwear' }) as HTMLInputElement).checked).toBe(true));
  expect(profileRequests.selectMascot).toHaveBeenCalledWith('fox');
  expect(readOnboarding('user-1').mascot).toBe('fox');
  expect(accountAvatarSource('user-1', client.getQueryData<UserProfile>(['me', 'profile']))).toBe('/illustrations/portraits/fox.svg');
});
