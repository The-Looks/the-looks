import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { authRequests } from '../../../services/guest/auth/requests';
import type { StylePreferences, WardrobeItem } from '../../../interface/dto/types';
import { readOnboarding, updateOnboarding } from '../../../services/user/onboarding/progress';
import { MascotPage } from './MascotPage';
import { OnboardingEntry, OnboardingLayout } from './OnboardingLayout';

const mock = vi.hoisted(() => ({ preferences: {} as StylePreferences, items: [] as WardrobeItem[] }));
vi.mock('../../../hooks/user/outfit/api', () => ({ usePreferences: () => ({ data: mock.preferences }) }));
vi.mock('../../../hooks/user/wardrobe/api', () => ({ useWardrobe: () => ({ data: mock.items }) }));
vi.mock('../../../services/guest/auth/requests', () => ({ authRequests: { me: vi.fn() } }));

const account = {
  id: 'new-user', username: 'Lan', email: 'lan@example.test',
  roles: ['USER'], permissions: [], createdAt: '2026-11-08T00:00:00Z',
};

function renderFlow(pathname = '/onboarding/check') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[{ pathname, state: { from: '/wardrobe' } }]}>
        <Routes>
          <Route path="/onboarding/check" element={<OnboardingEntry />} />
          <Route path="/onboarding" element={<OnboardingLayout />}>
            <Route index element={<h1>Khảo sát phong cách</h1>} />
            <Route path="welcome" element={<MascotPage />} />
          </Route>
          <Route path="/wardrobe" element={<h1>Tủ đồ</h1>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.mocked(authRequests.me).mockResolvedValue(account);
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  mock.preferences = {};
  mock.items = [];
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('welcomes an empty account, saves the dressed-up mascot, and advances to the survey', async () => {
  renderFlow();
  await screen.findByRole('heading', { name: 'Tạo linh vật của bạn' });
  fireEvent.click(screen.getByRole('button', { name: 'Cáo Phố · Streetwear' }));
  fireEvent.click(screen.getByRole('tab', { name: 'Mũ' }));
  fireEvent.click(screen.getByRole('button', { name: 'Mũ len' }));
  expect(screen.getByRole('button', { name: 'Mũ len' }).getAttribute('aria-pressed')).toBe('true');
  fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục đến khảo sát' }));
  expect(readOnboarding(account.id).mascot).toBe('fox');
  expect(readOnboarding(account.id).look).toEqual(expect.objectContaining({ mascot: 'fox', hat: 'beanie' }));
  await screen.findByRole('heading', { name: 'Khảo sát phong cách' });
  expect(screen.getByText('Phong cách', { selector: 'li' }).getAttribute('aria-current')).toBe('step');
  expect(readOnboarding('different-user').mascot).toBeUndefined();

  fireEvent.click(screen.getByRole('button', { name: 'Bỏ qua hướng dẫn' }));
  await screen.findByRole('heading', { name: 'Tủ đồ' });
  expect(readOnboarding(account.id)).toEqual(expect.objectContaining({ mascot: 'fox', dismissed: true }));
});

it('restores the previous selection on return to the welcome step', async () => {
  updateOnboarding(account.id, { mascot: 'rabbit' });
  renderFlow('/onboarding/welcome');
  expect((await screen.findByRole('button', { name: 'Thỏ Nơ · Nữ tính' })).getAttribute('aria-pressed')).toBe('true');
});

it.each(['preferences', 'items', 'skipped', 'admin'] as const)('preserves the destination for an account with %s', async (reason) => {
  if (reason === 'preferences') mock.preferences = { colors: ['white'] };
  if (reason === 'items') mock.items = [{ id: 'shirt', status: 'CONFIRMED', createdAt: account.createdAt }];
  if (reason === 'skipped') updateOnboarding(account.id, { dismissed: true });
  if (reason === 'admin') vi.mocked(authRequests.me).mockResolvedValue({ ...account, roles: ['ADMIN'] });

  renderFlow();
  await screen.findByRole('heading', { name: 'Tủ đồ' });
  expect(screen.queryByRole('heading', { name: 'Tạo linh vật của bạn' })).toBeNull();
});
