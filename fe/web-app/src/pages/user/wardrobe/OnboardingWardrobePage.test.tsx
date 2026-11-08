import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { OutfitSuggestion, WardrobeItem } from '../../../interface/dto/types';
import { OnboardingWardrobePage } from './OnboardingWardrobePage';

const mocks = vi.hoisted(() => ({ items: [] as WardrobeItem[], refetch: vi.fn(), wardrobeError: false,
  quick: { mutate: vi.fn(), data: null as OutfitSuggestion | null, isPending: false, isSuccess: false, isError: false, error: new Error('Outfit chưa sẵn sàng') } }));
vi.mock('../../../hooks/user/wardrobe/api', () => ({ useWardrobe: () => ({ data: mocks.items, isError: mocks.wardrobeError, error: new Error('Không tải được tủ đồ'), refetch: mocks.refetch }) }));
vi.mock('../../../hooks/user/outfit/api', () => ({ useQuickPick: () => mocks.quick }));
vi.mock('./AddItemPage', () => ({ AddItemPage: ({ onConfirmed }: { onConfirmed: () => void }) => <button onClick={onConfirmed}>Giả lập xác nhận các món</button> }));
vi.mock('../../../components/user/outfit/SaveButton', () => ({ SaveButton: () => <button>Lưu outfit</button> }));
function Url() { return <output data-testid="url">{useLocation().search}</output>; }
const show = (url = '/onboarding/wardrobe') => render(<MemoryRouter initialEntries={[url]}><OnboardingWardrobePage /><Url /></MemoryRouter>);
const ready = () => { mocks.items = ['TOP', 'BOTTOM', 'SHOES'].map((category, i) => ({ id: `item-${i}`, category: category as WardrobeItem['category'], status: 'CONFIRMED', createdAt: '2026-11-06T00:00:00Z' })); };
afterEach(cleanup);
beforeEach(() => { vi.clearAllMocks(); mocks.items = []; mocks.wardrobeError = false; Object.assign(mocks.quick, { data: null, isPending: false, isError: false, isSuccess: false }); });

it('starts with zero progress and does not request an outfit before enough confirmed items', () => {
  show(); expect((screen.getByRole('progressbar') as HTMLProgressElement).value).toBe(0);
  expect(screen.queryByRole('button', { name: 'Xem outfit đầu tiên' })).toBeNull();
  expect(mocks.quick.mutate).not.toHaveBeenCalled();
});
it('resumes progress from backend data after reload', () => {
  ready(); mocks.items = mocks.items.slice(0, 2); show();
  expect((screen.getByRole('progressbar') as HTMLProgressElement).value).toBe(2);
  expect(screen.getByText('Đã có áo')).toBeTruthy(); expect(screen.getByText('Đã có quần')).toBeTruthy();
});
it('automatically opens and requests the first outfit after confirming three suitable items', async () => {
  ready(); show();
  fireEvent.click(screen.getByRole('button', { name: 'Giả lập xác nhận các món' }));
  await waitFor(() => expect(mocks.quick.mutate).toHaveBeenCalledTimes(1));
  expect(screen.getByTestId('url').textContent).toBe('?step=outfit');
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Outfit đầu tiên của bạn');
});
it('does not generate for three incompatible accessories even if the URL requests outfit', () => {
  ready(); mocks.items = mocks.items.map((item) => ({ ...item, category: 'BAG' })); show('/onboarding/wardrobe?step=outfit');
  expect(screen.getByText(/Bạn đã đủ số món/)).toBeTruthy(); expect(mocks.quick.mutate).not.toHaveBeenCalled();
});
it('shows the generated outfit and links to save it or finish onboarding', async () => {
  ready(); mocks.quick.data = { items: [{ id: 'item-0', category: 'TOP' }, { id: 'item-1', category: 'BOTTOM' }], score: 0.9, reason: 'Phối từ tủ đồ của bạn' };
  mocks.quick.isSuccess = true; show('/onboarding/wardrobe?step=outfit');
  await waitFor(() => expect(mocks.quick.mutate).toHaveBeenCalledTimes(1));
  expect(screen.getByText('Phối từ tủ đồ của bạn')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Lưu outfit' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Vào trang chủ' }).getAttribute('href')).toBe('/');
});
it('offers retry on generation failure without resetting wardrobe progress', () => {
  ready(); mocks.quick.isError = true; show('/onboarding/wardrobe?step=outfit');
  expect(screen.getByText('Outfit chưa sẵn sàng')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Thử phối lại' })); expect(mocks.quick.mutate).toHaveBeenCalledTimes(2);
});
it('returns to adding items when the backend cannot compose for the current weather', () => {
  ready(); mocks.quick.isSuccess = true; show('/onboarding/wardrobe?step=outfit');
  fireEvent.click(screen.getByRole('button', { name: 'Thêm món khác' }));
  expect(screen.getByRole('progressbar')).toBeTruthy(); expect(screen.getByTestId('url').textContent).toBe('');
});
it('shows wardrobe failures and retries without sending a premature outfit request', () => {
  mocks.wardrobeError = true; show(); fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
  expect(mocks.refetch).toHaveBeenCalled(); expect(mocks.quick.mutate).not.toHaveBeenCalled();
});
