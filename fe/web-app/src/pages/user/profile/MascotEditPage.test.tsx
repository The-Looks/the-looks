import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { readLook } from '../../../services/user/onboarding/progress';
import { profileRequests, type UserProfile } from '../../../services/user/profile/requests';
import { MascotEditPage } from './MascotEditPage';

afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks(); });

it('saves a dressable mascot to the account and updates the profile cache', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } });
  client.setQueryData(['me'], { id: 'user-1', username: 'An' });
  client.setQueryData(['me', 'profile'], { username: 'An', hasAvatar: false, mascotId: 'cat' });
  vi.spyOn(profileRequests, 'selectMascot').mockResolvedValue({ username: 'An', hasAvatar: false, mascotId: 'panda' });

  render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/profile/mascot']}><Routes>
    <Route path="/profile/mascot" element={<MascotEditPage />} />
    <Route path="/profile" element={<h1>Hồ sơ</h1>} />
  </Routes></MemoryRouter></QueryClientProvider>);

  fireEvent.click(await screen.findByRole('button', { name: 'Trúc Mập · Tự phối' }));
  fireEvent.click(screen.getByRole('button', { name: 'Lưu linh vật' }));
  await screen.findByRole('heading', { name: 'Hồ sơ' });
  expect(profileRequests.selectMascot).toHaveBeenCalledWith('panda');
  expect(readLook('user-1')?.mascot).toBe('panda');
  expect(client.getQueryData<UserProfile>(['me', 'profile'])?.mascotId).toBe('panda');
});
