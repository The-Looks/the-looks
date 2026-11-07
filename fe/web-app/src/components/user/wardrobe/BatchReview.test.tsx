import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WardrobeItem } from '../../../interface/dto/types';
import { BatchReview } from './BatchReview';

const mutation = vi.hoisted(() => ({ mutate: vi.fn(), reset: vi.fn(), isPending: false, isError: false, error: null as Error | null }));
vi.mock('../../../hooks/user/wardrobe/api', () => ({ useConfirmAll: () => mutation }));
const items: WardrobeItem[] = ['TOP', 'BOTTOM', 'SHOES'].map((category, index) => ({
  id: `item-${index}`, category: category as WardrobeItem['category'], colors: ['white'],
  material: 'cotton', seasons: ['SUMMER'], styleTags: ['casual'], status: 'PENDING_REVIEW', createdAt: '2026-11-06T00:00:00Z',
}));
const show = (data = items) => render(<MemoryRouter><BatchReview items={data} /></MemoryRouter>);
afterEach(cleanup);
beforeEach(() => { vi.clearAllMocks(); mutation.isPending = false; mutation.isError = false; mutation.error = null; });

describe('BatchReview', () => {
  it('submits all three items once with inline edits and preserves other attributes', () => {
    show();
    fireEvent.change(screen.getByLabelText('Loại món 1'), { target: { value: 'OUTERWEAR' } });
    fireEvent.change(screen.getByLabelText('Màu món 1 (cách nhau bằng dấu phẩy)'), { target: { value: 'black, beige' } });
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận 3 món đã chọn' }));
    expect(mutation.mutate).toHaveBeenCalledTimes(1);
    expect(mutation.mutate.mock.calls[0]![0]).toEqual(items.map((item, index) => ({ itemId: item.id, attributes: {
      category: index === 0 ? 'OUTERWEAR' : item.category, colors: index === 0 ? ['black', 'beige'] : ['white'],
      material: 'cotton', seasons: ['SUMMER'], styleTags: ['casual'],
    } })));
  });

  it('only submits selected items and disables confirmation when none are selected', () => {
    show();
    fireEvent.click(screen.getByLabelText('Chọn món 2'));
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận 2 món đã chọn' }));
    expect(mutation.mutate.mock.calls[0]![0].map((entry: { itemId: string }) => entry.itemId)).toEqual(['item-0', 'item-2']);
    fireEvent.click(screen.getByRole('button', { name: 'Bỏ chọn tất cả' }));
    expect((screen.getByRole('button', { name: 'Xác nhận 0 món đã chọn' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Chọn tất cả' }));
    expect(screen.getByText('Đã chọn 3/3 món')).toBeTruthy();
  });

  it('keeps unselected items for a later confirmation after success', async () => {
    mutation.mutate.mockImplementation((entries, options) => options.onSuccess(entries.map((entry: { itemId: string }) => ({ id: entry.itemId }))));
    show();
    fireEvent.click(screen.getByLabelText('Chọn món 2'));
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận 2 món đã chọn' }));
    await waitFor(() => expect(screen.getByText('Đã thêm 2 món vào tủ đồ.')).toBeTruthy());
    expect(screen.getAllByText('Đã xác nhận')).toHaveLength(2);
    expect(screen.getByLabelText('Chọn món 2')).toBeTruthy();
    expect(screen.queryByLabelText('Chọn món 1')).toBeNull();
  });

  it('disables editing while saving and displays failures without clearing selections', () => {
    mutation.isPending = true;
    mutation.isError = true;
    mutation.error = new Error('Không thể lưu');
    show();
    expect((screen.getByRole('button', { name: 'Đang xác nhận…' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByLabelText('Loại món 1') as HTMLSelectElement).disabled).toBe(true);
    expect(screen.getByText('Đã chọn 3/3 món')).toBeTruthy();
    expect(screen.getByText('Không thể lưu')).toBeTruthy();
  });

  it('does not select confirmed items and requires a category for selected items', () => {
    show([{ ...items[0]!, status: 'CONFIRMED' }, { ...items[1]!, category: undefined }]);
    expect(screen.queryByLabelText('Chọn món 1')).toBeNull();
    expect((screen.getByRole('button', { name: 'Xác nhận 1 món đã chọn' }) as HTMLButtonElement).disabled).toBe(true);
  });
});
