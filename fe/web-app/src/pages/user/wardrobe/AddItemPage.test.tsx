import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { AddItemPage } from './AddItemPage';
const mock = vi.hoisted(() => ({ scan: vi.fn(), start: vi.fn() }));
vi.mock('../../../hooks/user/wardrobe/api', () => ({ useStartScan: () => ({ mutate: mock.start }), useScan: (id: string) => { mock.scan(id); return {}; } }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
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
