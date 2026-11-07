import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { addDays, todayInVietnam, WearCalendarPage } from './WearCalendarPage';

const mock = vi.hoisted(() => ({ features: [] as string[], days: [] as unknown[], plan: vi.fn(), unplan: vi.fn(), wear: vi.fn() }));
vi.mock('../../../hooks/user/billing/api', () => ({ useMyPlan: () => ({ data: { features: mock.features } }) }));
vi.mock('../../../hooks/user/wardrobe/api', () => ({ useWardrobe: () => ({ data: [] }) }));
vi.mock('../../../hooks/user/outfit/api', () => ({
  useWearCalendar: (_from: string, _to: string, enabled: boolean) => enabled ? { data: mock.days } : { isPending: true },
  useSavedOutfits: () => ({ data: [{ id: 'o1', itemIds: [], occasion: 'SCHOOL', createdAt: '2026-11-01T00:00:00Z' }] }),
  usePlanDay: () => ({ mutate: mock.plan }),
  useUnplanDay: () => ({ mutate: mock.unplan }),
  useWearOutfit: () => ({ mutate: mock.wear }),
}));
afterEach(() => { cleanup(); vi.clearAllMocks(); mock.features = []; mock.days = []; });

it('computes the Vietnam calendar day and date arithmetic across months', () => {
  expect(todayInVietnam(new Date('2026-11-07T17:30:00Z'))).toBe('2026-11-08');
  expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
  expect(addDays('2026-11-01', -1)).toBe('2026-10-31');
});

it('shows the Pro upgrade for plans without WEAR_CALENDAR', () => {
  render(<MemoryRouter><WearCalendarPage /></MemoryRouter>);
  expect(screen.getByText('Lên lịch outfit cả tuần với Pro')).toBeTruthy();
});

it('plans an outfit for tomorrow and offers wearing today\'s planned outfit', () => {
  mock.features = ['WEAR_CALENDAR'];
  mock.days = [{ date: todayInVietnam(), plannedOutfitId: 'o1', wornOutfitIds: [] }];
  render(<MemoryRouter><WearCalendarPage /></MemoryRouter>);

  fireEvent.change(screen.getByLabelText('Chọn outfit cho Ngày mai'), { target: { value: 'o1' } });
  expect(mock.plan).toHaveBeenCalledWith({ date: addDays(todayInVietnam(), 1), outfitId: 'o1' });

  fireEvent.click(screen.getByText('Mặc bộ này'));
  expect(mock.wear).toHaveBeenCalledWith('o1');
});
