import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { AddItemPage } from './AddItemPage';
const mock = vi.hoisted(() => ({ scan: vi.fn(), start: vi.fn(), data: undefined as unknown }));
vi.mock('../../../hooks/user/wardrobe/api', () => ({ useStartScan: () => ({ mutate: mock.start }), useScan: (id: string) => { mock.scan(id); return { data: mock.data }; } }));
afterEach(() => { cleanup(); vi.clearAllMocks(); mock.data = undefined; });
function Url() { return <output data-testid="url">{useLocation().search}</output>; }
it('restores an in-progress scan from the onboarding URL on reload', () => {
  render(<MemoryRouter initialEntries={['/onboarding/wardrobe?scan=scan-previous']}><AddItemPage guided /></MemoryRouter>);
  expect(mock.scan).toHaveBeenCalledWith('scan-previous');
});
it('stores a started guided scan in the URL for resume without another upload', () => {
  mock.start.mockImplementation((_files, options) => options.onSuccess({ id: 'scan-new' }));
  render(<MemoryRouter initialEntries={['/onboarding/wardrobe']}><AddItemPage guided /><Url /></MemoryRouter>);
  fireEvent.change(screen.getByLabelText('Chọn ảnh từ máy'), { target: { files: [new File(['test'], 'closet.jpg', { type: 'image/jpeg' })] } });
  expect(screen.getByTestId('url').textContent).toBe('?scan=scan-new');
  expect(mock.scan).toHaveBeenLastCalledWith('scan-new');
});
it('uploads images pasted with Ctrl+V and ignores pasted text', () => {
  render(<MemoryRouter><AddItemPage /></MemoryRouter>);
  const image = new File(['img'], 'image.png', { type: 'image/png' });
  fireEvent.paste(window, { clipboardData: { files: [new File(['hi'], 'note.txt', { type: 'text/plain' })] } });
  expect(mock.start).not.toHaveBeenCalled();
  fireEvent.paste(window, { clipboardData: { files: [image] } });
  expect(mock.start).toHaveBeenCalledWith([image], expect.anything());
});
it('resumes a scan after reloading the normal add page and shows items as they are cut out', () => {
  mock.data = { id: 'scan-7', status: 'PROCESSING', imageCount: 3, skippedForLimit: 0, createdAt: '2026-11-08T00:00:00Z',
    items: [{ id: 'a', status: 'PENDING_REVIEW', category: 'TOP', createdAt: '2026-11-08T00:00:00Z' },
      { id: 'b', status: 'PENDING_REVIEW', category: 'SHOES', createdAt: '2026-11-08T00:00:00Z' }] };
  render(<MemoryRouter initialEntries={['/wardrobe/add?scan=scan-7']}><AddItemPage /></MemoryRouter>);
  expect(mock.scan).toHaveBeenCalledWith('scan-7');
  expect(screen.getByText('Đã tách được 2 món, đang tách tiếp…')).toBeTruthy();
  expect(screen.getByLabelText('Món vừa tách').children).toHaveLength(2);
});
