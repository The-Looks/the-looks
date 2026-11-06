import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ApiError } from '../../../services/shared/api/client';
import { WardrobeStatsPage } from './WardrobeStatsPage';

const mocks = vi.hoisted(() => ({
  features: ['WARDROBE_STATS'], planError: false, planPending: false,
  statsError: null as Error | null, statsPending: false, enabled: vi.fn(), retry: vi.fn(), planRetry: vi.fn(),
  data: { totalItems: 3, wornItems: 1, neverWornItems: 2, wearRatePercent: 33.3,
    byCategory: [{ key: 'TOP', count: 2 }, { key: 'BOTTOM', count: 1 }], byColor: [{ key: 'white', count: 2 }, { key: 'UNKNOWN', count: 1 }],
    inactiveCount: 2, inactiveAfterDays: 30, asOf: '2026-11-06T00:00:00Z', unusedItems: [
      { item: { id: 'one', category: 'TOP', colors: ['white'] }, lastWornAt: null as string | null, daysSinceWear: null as number | null },
      { item: { id: 'two', category: 'BOTTOM', colors: [] }, lastWornAt: '2026-10-01T00:00:00Z' as string | null, daysSinceWear: 36 as number | null },
    ] },
}));
vi.mock('../../../hooks/user/billing/api', () => ({ useMyPlan: () => ({ data: { features: mocks.features }, isError: mocks.planError, isPending: mocks.planPending, error: new Error('Billing chưa sẵn sàng'), refetch: mocks.planRetry }) }));
vi.mock('../../../hooks/user/wardrobe/api', () => ({ useWardrobeStats: (enabled: boolean) => {
  mocks.enabled(enabled); return { data: mocks.data, isError: !!mocks.statsError, error: mocks.statsError, isPending: mocks.statsPending, refetch: mocks.retry };
} }));
const show = () => render(<MemoryRouter><WardrobeStatsPage /></MemoryRouter>);
const initial = structuredClone(mocks.data);
afterEach(cleanup);
beforeEach(() => { vi.clearAllMocks(); mocks.features = ['WARDROBE_STATS']; mocks.planError = false; mocks.planPending = false; mocks.statsPending = false; mocks.statsError = null; mocks.data = structuredClone(initial); });

it('shows upgrade and disables stats fetching for Free or Plus even if cached data exists', () => {
  mocks.features = []; show();
  expect(mocks.enabled).toHaveBeenCalledWith(false);
  expect(screen.getByRole('link', { name: 'Khám phá gói Pro' }).getAttribute('href')).toBe('/plans');
  expect(screen.queryByText('33,3%')).toBeNull(); expect(screen.queryByRole('meter')).toBeNull();
});
it('shows Pro metrics, accessible charts and distinct never-worn/old wear states', () => {
  show(); expect(mocks.enabled).toHaveBeenCalledWith(true); expect(screen.getByText('33,3%')).toBeTruthy();
  expect(screen.getByRole('meter', { name: 'Áo: 2 món' })).toBeTruthy();
  expect(screen.getByRole('meter', { name: 'Chưa có màu: 1 món' })).toBeTruthy();
  expect(screen.getByText('Chưa từng mặc', { selector: 'strong' })).toBeTruthy(); expect(screen.getByText('36 ngày chưa mặc')).toBeTruthy();
  expect(screen.getByRole('link', { name: /36 ngày chưa mặc/ }).getAttribute('href')).toBe('/wardrobe/two');
});
it('shows empty wardrobe without fabricating chart data', () => {
  Object.assign(mocks.data, { totalItems: 0, wornItems: 0, neverWornItems: 0, wearRatePercent: 0, byCategory: [], byColor: [], unusedItems: [] });
  show(); expect(screen.getByText('Tủ đồ chưa có món đã xác nhận')).toBeTruthy(); expect(screen.queryByRole('meter')).toBeNull();
  expect(screen.getByRole('link', { name: 'Thêm món đồ' }).getAttribute('href')).toBe('/wardrobe/add');
});
it('hides cached statistics after the backend denies expired Pro access', () => {
  mocks.statsError = new ApiError(403, 'Pro required'); show();
  expect(screen.getByRole('link', { name: 'Khám phá gói Pro' })).toBeTruthy(); expect(screen.queryByText('33,3%')).toBeNull();
});
it('offers retry for dependency failures without showing stale numbers', () => {
  mocks.statsError = new ApiError(503, 'Lịch sử mặc chưa sẵn sàng'); show();
  expect(screen.getByText('Lịch sử mặc chưa sẵn sàng')).toBeTruthy(); expect(screen.queryByText('33,3%')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Thử lại' })); expect(mocks.retry).toHaveBeenCalled();
});
it('keeps billing failures separate from an upgrade decision', () => {
  mocks.planError = true; show(); expect(screen.getByText('Billing chưa sẵn sàng')).toBeTruthy();
  expect(screen.queryByRole('link', { name: 'Khám phá gói Pro' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Thử lại' })); expect(mocks.planRetry).toHaveBeenCalled();
});
it('has loading states and refreshes both entitlements and statistics', () => {
  const view = show(); fireEvent.click(screen.getByRole('button', { name: 'Làm mới' }));
  expect(mocks.retry).toHaveBeenCalled(); expect(mocks.planRetry).toHaveBeenCalled();
  mocks.statsPending = true; view.rerender(<MemoryRouter><WardrobeStatsPage /></MemoryRouter>);
  expect(screen.getByText('Đang tổng hợp tủ đồ và lịch sử mặc…')).toBeTruthy();
});
