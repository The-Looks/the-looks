import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { useScan } from './api';

const scan = vi.hoisted(() => vi.fn());
vi.mock('../../../services/user/wardrobe/requests', () => ({ wardrobeRequests: { scan } }));
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
