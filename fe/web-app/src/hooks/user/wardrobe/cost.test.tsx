import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { useCostPerWear } from './api';
const request = vi.hoisted(() => ({ item: vi.fn(), summary: vi.fn() }));
vi.mock('../../../services/user/wardrobe/requests', () => ({ wardrobeRequests: { itemCost: request.item, costSummary: request.summary } }));
afterEach(cleanup);
it('gates requests and keeps per-item data separate from the summary', async () => {
  request.item.mockResolvedValue({ wearCount: 10 }); request.summary.mockResolvedValue({ items: [], totalItems: 0 });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const { result, rerender } = renderHook(({ id, enabled }) => useCostPerWear(id, enabled), {
    initialProps: { id: 'item-1' as string | undefined, enabled: false },
    wrapper: ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
  });
  expect(request.item).not.toHaveBeenCalled(); rerender({ id: 'item-1', enabled: true });
  await waitFor(() => expect(result.current.data?.items).toEqual([{ wearCount: 10 }]));
  expect(request.item).toHaveBeenCalledWith('item-1', expect.any(AbortSignal));
  rerender({ id: undefined, enabled: true }); await waitFor(() => expect(request.summary).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(result.current.data?.totalItems).toBe(0)); client.clear();
});
