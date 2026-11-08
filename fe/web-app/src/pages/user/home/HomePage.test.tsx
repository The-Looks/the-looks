import { cleanup, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { writeProfileDraft } from '../../../services/user/profile/draft';
import { HomePage } from './HomePage';

vi.mock('../../../hooks/user/wardrobe/api', () => ({ useWardrobe: () => ({ data: [] }) }));
vi.mock('../../../hooks/user/outfit/api', () => ({ useSavedOutfits: () => ({ data: [] }) }));
vi.mock('../../../hooks/user/voting/api', () => ({ useMyPolls: () => ({ data: [] }) }));
vi.mock('../../../components/user/outfit/QuickPickCard', () => ({ QuickPickCard: () => null }));
vi.mock('../../../components/user/wardrobe/WardrobeSummary', () => ({ WardrobeSummary: () => null }));
vi.mock('../../../components/user/billing/MyPlanCard', () => ({ MyPlanCard: () => null }));

afterEach(() => { cleanup(); localStorage.clear(); });

function showHome(userId: string, username: string) {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } });
  client.setQueryData(['me'], { id: userId, username });
  client.setQueryData(['me', 'profile'], { username, hasAvatar: false, mascotId: userId === 'user-1' ? 'fox' : null });
  return render(<QueryClientProvider client={client}><MemoryRouter><HomePage /></MemoryRouter></QueryClientProvider>);
}

it('greets the account by name and links its unfinished profile draft', async () => {
  writeProfileDraft('user-1', 'Tên chưa lưu', 'Huế');
  showHome('user-1', 'An');
  expect(screen.getByRole('heading', { name: 'Chào An!' })).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Chào An!' }).querySelector('img')?.getAttribute('src')).toBe('/illustrations/portraits/fox.svg');
  expect(await screen.findByRole('link', { name: 'Tiếp tục chỉnh sửa hồ sơ' })).toHaveProperty('href', expect.stringContaining('/profile'));
});

it('does not show another account draft', () => {
  writeProfileDraft('user-1', 'Tên chưa lưu', 'Huế');
  showHome('user-2', 'Bình');
  expect(screen.getByRole('heading', { name: 'Chào Bình!' })).toBeTruthy();
  expect(screen.queryByRole('heading', { name: 'Tiếp tục việc dở' })).toBeNull();
});
