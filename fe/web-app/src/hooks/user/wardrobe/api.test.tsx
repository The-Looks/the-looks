import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { useDelete, useScan } from './api';

const { scan, remove, item, items } = vi.hoisted(() => ({ scan: vi.fn(), remove: vi.fn(), item: vi.fn(), items: vi.fn() }));
vi.mock('../../../services/user/wardrobe/requests', () => ({ wardrobeRequests: { scan, remove, item, items } }));
afterEach(cleanup);

it('finishes polling a completed scan without invalidating its own in-flight query', async () => {
  scan.mockResolvedValue({ id: 'scan-1', status: 'DONE', items: [], imageCount: 1, skippedForLimit: 0 });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidate = vi.spyOn(client, 'invalidateQueries');
  const { result } = renderHook(() => useScan('scan-1'), {
    wrapper: ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
  });
  await waitFor(() => expect(result.current.data?.status).toBe('DONE'));
  expect(scan).toHaveBeenCalledTimes(1);
  expect(invalidate).toHaveBeenCalledWith({ queryKey: ['wardrobe', 'list'] });
  client.clear();
});

it('does not reload the item it just deleted but refreshes the wardrobe list', async () => {
  remove.mockResolvedValue(undefined);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const itemQuery = { queryKey: ['wardrobe', 'item', 'gone'], queryFn: item };
  const listQuery = { queryKey: ['wardrobe', 'list', undefined, undefined], queryFn: items };
  item.mockResolvedValue({ id: 'gone' }); items.mockResolvedValue([]);
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  await client.prefetchQuery(itemQuery); await client.prefetchQuery(listQuery);
  const invalidate = vi.spyOn(client, 'invalidateQueries');
  const { result } = renderHook(() => useDelete(), { wrapper });
  await result.current.mutateAsync('gone');
  const predicate = invalidate.mock.calls[0]![0]!.predicate!;
  expect(predicate(client.getQueryCache().find({ queryKey: itemQuery.queryKey })!)).toBe(false);
  expect(predicate(client.getQueryCache().find({ queryKey: listQuery.queryKey })!)).toBe(true);
  client.clear();
});
