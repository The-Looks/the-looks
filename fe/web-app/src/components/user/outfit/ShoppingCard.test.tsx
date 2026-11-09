import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ShoppingCard } from './ShoppingCard';

const mock = vi.hoisted(() => ({ data: undefined as unknown }));
vi.mock('../../../hooks/user/outfit/api', () => ({
  useShopping: () => ({ data: mock.data }),
  useOpenProduct: () => ({ mutate: vi.fn(), isPending: false, isError: false }),
}));
afterEach(cleanup);

const product = (id: string, title: string) => ({ id, title, imageUrl: null, minPriceVnd: 200000, maxPriceVnd: 200000, shopName: 'Shop', unitsSold: 0, source: 'TIKTOK_SHOP' });

it('shows a full look for the occasion even when the closet lacks nothing', () => {
  mock.data = { gap: null, products: [], look: [
    { category: 'TOP', label: 'áo đi học', owned: true, product: product('a', 'Áo thun') },
    { category: 'ACCESSORY', label: 'phụ kiện đi học', owned: false, product: product('b', 'Túi tote') },
  ] };
  render(<ShoppingCard occasion="SCHOOL" />);
  expect(screen.getByRole('heading', { name: 'Bộ gợi ý mua cho dịp đi học' })).toBeTruthy();
  const look = screen.getByLabelText('Bộ đồ hợp dịp');
  expect(within(look).getByText('Tủ đã có')).toBeTruthy();
  expect(within(look).getByText('Tủ còn thiếu')).toBeTruthy();
  expect(screen.queryByText(/Thêm lựa chọn/)).toBeNull();
});

it('adds more choices for the missing item', () => {
  mock.data = { gap: { category: 'SHOES', label: 'giày' }, products: [product('c', 'Sneaker')], look: [] };
  render(<ShoppingCard occasion="WORK" />);
  expect(screen.getByRole('heading', { name: 'Tủ đồ còn thiếu giày' })).toBeTruthy();
  expect(screen.getByText('Thêm lựa chọn cho giày')).toBeTruthy();
});
