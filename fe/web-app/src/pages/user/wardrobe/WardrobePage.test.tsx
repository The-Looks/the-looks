import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { WardrobePage } from './WardrobePage';

const mocks = vi.hoisted(() => ({ hook: vi.fn(), refetch: vi.fn(), data: { items: [] as { id: string; status: string; category: string; createdAt: string }[], total: 60, page: 0, size: 24 }, error: false }));
vi.mock('../../../hooks/user/wardrobe/api', () => ({ useWardrobeSearch: (filters: unknown) => { mocks.hook(filters); return { data: mocks.error ? undefined : mocks.data, isError: mocks.error, isPending: false, isFetching: false, error: new Error('Lịch sử mặc chưa sẵn sàng'), refetch: mocks.refetch }; } }));
function Location() { const location = useLocation(); const navigate = useNavigate(); return <><output data-testid="url">{location.search}</output><button onClick={() => navigate(-1)}>Back</button></>; }
function show(url = '/wardrobe') { return render(<MemoryRouter initialEntries={[url]}><WardrobePage /><Location /></MemoryRouter>); }
afterEach(cleanup);
beforeEach(() => { vi.clearAllMocks(); mocks.error = false; mocks.data.items = [{ id: 'one', status: 'CONFIRMED', category: 'TOP', createdAt: '2026-11-06T00:00:00Z' }]; mocks.data.total = 60; });

it('restores filters on reload and resets the page when a filter changes', () => {
  show('/wardrobe?category=TOP&color=white&page=1&style=casual');
  expect((screen.getByLabelText('Loại đồ') as HTMLSelectElement).value).toBe('TOP');
  expect((screen.getByLabelText('Màu') as HTMLInputElement).value).toBe('white');
  fireEvent.change(screen.getByLabelText('Mùa'), { target: { value: 'SUMMER' } });
  expect(screen.getByTestId('url').textContent).toContain('category=TOP');
  expect(screen.getByTestId('url').textContent).toContain('season=SUMMER');
  expect(screen.getByTestId('url').textContent).not.toContain('page=');
});
it('pages and returns with browser history while retaining filters', () => {
  show('/wardrobe?category=TOP');
  expect((screen.getByRole('button', { name: 'Trang trước' }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Trang sau' }));
  expect(screen.getByTestId('url').textContent).toContain('page=1');
  expect(screen.getByTestId('url').textContent).toContain('category=TOP');
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  expect(screen.getByTestId('url').textContent).toBe('?category=TOP');
});
it('shows an empty result and clears all filters', () => {
  mocks.data.items = []; mocks.data.total = 0; show('/wardrobe?color=red&style=office');
  expect(screen.getByText('Không tìm thấy món đồ')).toBeTruthy();
  fireEvent.click(screen.getAllByRole('button', { name: 'Xoá bộ lọc' })[0]!);
  expect(screen.getByTestId('url').textContent).toBe('');
});
it('keeps wear sort selected and offers retry when outfit history is unavailable', () => {
  mocks.error = true; show('/wardrobe?sort=LEAST_RECENTLY_WORN');
  expect((screen.getByLabelText('Sắp xếp') as HTMLSelectElement).value).toBe('LEAST_RECENTLY_WORN');
  expect(screen.getByText('Lịch sử mặc chưa sẵn sàng')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Thử lại' })); expect(mocks.refetch).toHaveBeenCalled();
});
