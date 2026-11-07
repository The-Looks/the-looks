import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ApiError } from '../../../services/shared/api/client';
import { CostPerWearSection } from './CostPerWearSection';

const mocks = vi.hoisted(() => ({ features: ['COST_PER_WEAR'], enabled: vi.fn(), retry: vi.fn(), error: null as Error | null,
  pending: false, rows: [{ item: { id: 'item-1', category: 'TOP', purchasePrice: 300000 as number | null }, wearCount: 10, costPerWear: 30000 as number | null, status: 'CALCULATED' }] }));
vi.mock('../../../hooks/user/billing/api', () => ({ useMyPlan: () => ({ data: { features: mocks.features } }) }));
vi.mock('../../../hooks/user/wardrobe/api', () => ({ useCostPerWear: (id: string | undefined, allowed: boolean) => {
  mocks.enabled(id, allowed); return { data: { items: mocks.rows, totalItems: mocks.rows.length }, isPending: mocks.pending, isError: !!mocks.error, error: mocks.error, refetch: mocks.retry };
} }));
const show = (id?: string) => render(<MemoryRouter><CostPerWearSection itemId={id} /></MemoryRouter>);
afterEach(cleanup);
beforeEach(() => { vi.clearAllMocks(); mocks.features = ['COST_PER_WEAR']; mocks.error = null; mocks.pending = false;
  mocks.rows = [{ item: { id: 'item-1', category: 'TOP', purchasePrice: 300000 }, wearCount: 10, costPerWear: 30000, status: 'CALCULATED' }]; });

it('shows 300000 VND worn ten times as 30000 VND per wear', () => {
  show('item-1'); expect(mocks.enabled).toHaveBeenCalledWith('item-1', true);
  expect(screen.getByText('30.000đ/lần')).toBeTruthy(); expect(screen.getByText(/300.000đ · 10 lần mặc/)).toBeTruthy();
});
it('blocks fetching and cached values without the COST_PER_WEAR feature', () => {
  mocks.features = ['WARDROBE_STATS']; show('item-1'); expect(mocks.enabled).toHaveBeenCalledWith('item-1', false);
  expect(screen.getByRole('link', { name: 'Xem gói Pro' }).getAttribute('href')).toBe('/plans'); expect(screen.queryByText('30.000đ/lần')).toBeNull();
});
it('shows missing price separately from never-worn and real zero cost', () => {
  mocks.rows[0]!.item.purchasePrice = null; mocks.rows[0]!.costPerWear = null; mocks.rows[0]!.status = 'MISSING_PRICE';
  const view = show(); expect(screen.getByText('Chưa nhập giá mua')).toBeTruthy(); expect(screen.getByRole('link', { name: 'Bổ sung giá mua' })).toBeTruthy();
  mocks.rows[0]!.item.purchasePrice = 300000; mocks.rows[0]!.wearCount = 0; mocks.rows[0]!.status = 'NEVER_WORN';
  view.rerender(<MemoryRouter><CostPerWearSection /></MemoryRouter>); expect(screen.getByText('Chưa từng mặc')).toBeTruthy(); expect(screen.queryByText('0đ/lần')).toBeNull();
  mocks.rows[0]!.item.purchasePrice = 0; mocks.rows[0]!.wearCount = 1; mocks.rows[0]!.status = 'CALCULATED'; mocks.rows[0]!.costPerWear = 0;
  view.rerender(<MemoryRouter><CostPerWearSection /></MemoryRouter>); expect(screen.getByText('0đ/lần')).toBeTruthy();
});
it('links summary entries to their item details', () => {
  show(); expect(mocks.enabled).toHaveBeenCalledWith(undefined, true);
  expect(screen.getByRole('link', { name: 'Áo' }).getAttribute('href')).toBe('/wardrobe/item-1');
});
it('hides stale data when the backend denies Pro or fails to read history', () => {
  mocks.error = new ApiError(403, 'Pro required'); const view = show();
  expect(screen.queryByText('30.000đ/lần')).toBeNull(); expect(screen.getByRole('link', { name: 'Xem gói Pro' })).toBeTruthy();
  mocks.error = new ApiError(503, 'Không tải được lượt mặc'); view.rerender(<MemoryRouter><CostPerWearSection /></MemoryRouter>);
  expect(screen.getByText('Không tải được lượt mặc')).toBeTruthy(); fireEvent.click(screen.getByRole('button', { name: 'Thử lại' })); expect(mocks.retry).toHaveBeenCalled();
});
it('shows loading and empty states', () => {
  mocks.pending = true; const view = show(); expect(screen.getByText('Đang tính chi phí mỗi lần mặc…')).toBeTruthy();
  mocks.pending = false; mocks.rows = []; view.rerender(<MemoryRouter><CostPerWearSection /></MemoryRouter>);
  expect(screen.getByText('Chưa có món đã xác nhận để tính chi phí.')).toBeTruthy();
});
