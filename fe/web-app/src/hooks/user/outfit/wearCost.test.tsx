import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { useWearOutfit } from './api';
import { useCostPerWear } from '../wardrobe/api';

const state = vi.hoisted(() => ({ count: 10 }));
vi.mock('../../../services/user/outfit/requests', () => ({ outfitRequests: { wearOutfit: async () => { state.count++; } } }));
vi.mock('../../../services/user/wardrobe/requests', () => ({ wardrobeRequests: { itemCost: async () => ({ wearCount: state.count, costPerWear: 300000 / state.count }) } }));
afterEach(cleanup);
it('refreshes an active cost query after recording another wear', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const { result } = renderHook(() => ({ cost: useCostPerWear('item-1', true), wear: useWearOutfit() }), {
    wrapper: ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
  });
  await waitFor(() => expect(result.current.cost.data?.items[0]?.wearCount).toBe(10));
  await act(async () => { await result.current.wear.mutateAsync('outfit-1'); });
  await waitFor(() => expect(result.current.cost.data?.items[0]?.wearCount).toBe(11));
  expect(result.current.cost.data?.items[0]?.costPerWear).toBeLessThan(30000); client.clear();
});
