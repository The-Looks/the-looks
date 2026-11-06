import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ItemDetailPage } from './ItemDetailPage';

const mocks = vi.hoisted(() => ({
  data: { id: 'item-1', status: 'CONFIRMED', category: 'TOP', colors: ['white'], material: 'cotton', seasons: [], styleTags: ['casual'],
    createdAt: '2026-11-06T00:00:00Z', purchasePrice: 300000 as number | null, purchaseDate: '2026-11-06' as string | null, brand: 'Uniqlo' as string | null },
  update: vi.fn(), confirm: vi.fn(),
}));
vi.mock('../../../hooks/user/wardrobe/api', () => ({
  useItem: () => ({ data: mocks.data }),
  useConfirm: () => ({ mutate: mocks.confirm }),
  useUpdateItem: () => ({ mutate: mocks.update }),
  useDelete: () => ({ mutate: vi.fn() }),
}));
afterEach(cleanup);
beforeEach(() => { vi.clearAllMocks(); mocks.data.status = 'CONFIRMED'; mocks.data.purchasePrice = 300000; mocks.data.purchaseDate = '2026-11-06'; mocks.data.brand = 'Uniqlo'; });
const show = () => render(<MemoryRouter><ItemDetailPage /></MemoryRouter>);

describe('purchase details', () => {
  it('loads and updates price, date and brand while retaining clothing attributes', async () => {
    show();
    await waitFor(() => expect((screen.getByLabelText('Giá mua (VND)') as HTMLInputElement).value).toBe('300000'));
    fireEvent.change(screen.getByLabelText('Giá mua (VND)'), { target: { value: '450000.50' } });
    fireEvent.change(screen.getByLabelText('Ngày mua'), { target: { value: '2026-10-20' } });
    fireEvent.change(screen.getByLabelText('Thương hiệu'), { target: { value: 'H&M' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ purchasePrice: 450000.5, purchaseDate: '2026-10-20', brand: 'H&M', colors: ['white'], styleTags: ['casual'] }));
  });

  it('clears optional metadata and treats zero as a valid purchase price', () => {
    show();
    fireEvent.change(screen.getByLabelText('Giá mua (VND)'), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText('Ngày mua'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Thương hiệu'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    expect(mocks.update).toHaveBeenLastCalledWith(expect.objectContaining({ purchasePrice: 0, purchaseDate: null, brand: null }));
    fireEvent.change(screen.getByLabelText('Giá mua (VND)'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    expect(mocks.update).toHaveBeenLastCalledWith(expect.objectContaining({ purchasePrice: null }));
  });

  it('blocks negative, excessive and overprecise prices', () => {
    show();
    for (const value of ['-1', '0.001', '1000000000000']) {
      fireEvent.change(screen.getByLabelText('Giá mua (VND)'), { target: { value } });
      expect((screen.getByRole('button', { name: 'Lưu thay đổi' }) as HTMLButtonElement).disabled).toBe(true);
      fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    }
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('includes purchase details when confirming a pending item', () => {
    mocks.data.status = 'PENDING_REVIEW';
    show();
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận món đồ' }));
    expect(mocks.confirm).toHaveBeenCalledWith(expect.objectContaining({ purchasePrice: 300000, brand: 'Uniqlo', purchaseDate: '2026-11-06' }));
  });
});
